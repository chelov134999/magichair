import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, paddle-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const PADDLE_WEBHOOK_SECRET =
  Deno.env.get("PADDLE_WEBHOOK_SECRET") ?? Deno.env.get("PADDLE_WEBHOOK_SECRET_DEV") ?? "";

const textEncoder = new TextEncoder();

const base64ToUint8 = (b64: string) => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
};

const verifySignature = async (secret: string, payload: string, receivedSignature: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  const expectedBytes = new Uint8Array(signatureArrayBuffer);
  const receivedBytes = base64ToUint8(receivedSignature.trim());
  return timingSafeEqual(expectedBytes, receivedBytes);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !PADDLE_WEBHOOK_SECRET) {
    return new Response("Server not configured", { status: 500, headers: corsHeaders });
  }

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("paddle-signature");
  if (!signatureHeader) {
    return new Response("Missing paddle-signature", { status: 400, headers: corsHeaders });
  }

  const isValid = await verifySignature(PADDLE_WEBHOOK_SECRET, rawBody, signatureHeader);
  if (!isValid) {
    return new Response("Invalid signature", { status: 401, headers: corsHeaders });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const eventType = payload.event_type || payload.eventType || payload.type || "unknown";
  const data = payload.data || payload;

  // Expect user id to be passed in custom_data from checkout creation
  const userId =
    data?.custom_data?.user_id ||
    data?.custom_data?.supabase_user_id ||
    data?.custom_data?.userId ||
    null;

  if (!userId) {
    console.log("Webhook missing user_id in custom_data; skipping update.");
    return new Response(JSON.stringify({ received: true, skipped: "no_user_id" }), {
      status: 202,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: existingUser, error: userErr } = await supabase.auth.admin.getUserById(userId);
  if (userErr || !existingUser?.user) {
    console.error("User fetch failed", userErr);
    return new Response("User not found", { status: 404, headers: corsHeaders });
  }

  const currentMeta = existingUser.user.user_metadata || {};

  // Determine subscription state
  const status = data?.status || data?.subscription?.status || data?.payment?.status;
  const isActive = ["active", "paid", "trialing", "past_due"].includes((status || "").toLowerCase());

  // Determine plan type by price id
  const priceId =
    data?.items?.[0]?.price?.id ||
    data?.subscription?.items?.[0]?.price?.id ||
    data?.price_id ||
    data?.price?.id ||
    "";
  const plan =
    priceId === Deno.env.get("VITE_PADDLE_PRICE_YEAR") ? "yearly" : priceId ? "monthly" : currentMeta.subscription_type;

  // Credits: if checkout custom_data.credits set, add to existing; else default 0.
  const grantCreditsRaw = data?.custom_data?.credits ?? data?.credits ?? 0;
  const grantCredits = Number.isFinite(Number(grantCreditsRaw)) ? Number(grantCreditsRaw) : 0;
  const currentCredits = Number.isFinite(Number(currentMeta.credits)) ? Number(currentMeta.credits) : 0;
  const newCredits = currentCredits + grantCredits;

  const updatePayload: Record<string, unknown> = {
    ...currentMeta,
    is_subscribed: isActive,
    subscription_type: plan,
    credits: newCredits,
    paddle_subscription_id: data?.id || data?.subscription_id || currentMeta.paddle_subscription_id,
    paddle_event_type: eventType,
    paddle_last_status: status,
    paddle_price_id: priceId || currentMeta.paddle_price_id,
  };

  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: updatePayload,
  });

  if (updateErr) {
    console.error("Failed to update user metadata", updateErr);
    return new Response("Update failed", { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ received: true, event: eventType, user_id: userId }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
