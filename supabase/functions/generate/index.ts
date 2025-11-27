import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "*";
  const allowed = ["https://mdzh.io", "https://www.mdzh.io", "http://localhost:5173"];
  const allowOrigin = allowed.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    return new Response("Server configuration missing.", { status: 500, headers: corsHeaders(req) });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders(req) });
    }

    const { originalImageDataUrl, styleDescription, colorDescription, gender, angle } = await req.json();
    if (!styleDescription || !colorDescription || !gender || !angle) {
      return new Response("Missing parameters", { status: 400, headers: corsHeaders(req) });
    }

    let prompt = "";
    const coreRequest = `Change the hairstyle to: ${styleDescription}. Hair color: ${colorDescription}.`;

    if (!originalImageDataUrl) {
      prompt = `Generate a high-quality, photorealistic portrait of a ${gender} model with this hairstyle: ${styleDescription}. Hair color ${colorDescription}.`;
      if (angle === "Front") {
        prompt += " Front view. Professional studio lighting, neutral background. Focus on hair texture and cut details. 8k resolution.";
      } else if (angle === "Side") {
        prompt += " Side profile (90 degrees). Neutral background. Focus on silhouette and layers.";
      } else if (angle === "Back") {
        prompt += " Back view. Focus on texture, length, and cut from behind.";
      }
    } else {
      if (angle === "Front") {
        prompt = `${coreRequest} Maintain the exact facial features, skin tone, lighting, and background of the original image. Only change the hair. Realistic portrait.`;
      } else if (angle === "Side") {
        prompt = `Generate a side-profile (90 degrees) of this person with hairstyle: ${styleDescription} and color ${colorDescription}. Keep likeness, clothing style, and lighting. Simple background.`;
      } else if (angle === "Back") {
        prompt = `Generate a back view of this person showing hairstyle: ${styleDescription} and color ${colorDescription}. Focus on hair texture and cut details. Match clothing tone.`;
      }
    }

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];

    if (originalImageDataUrl) {
      const matches = originalImageDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return new Response("Invalid image data format", { status: 400, headers: corsHeaders(req) });
      }
      const [, mimeType, base64Data] = matches;
      parts.unshift({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0.9 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(`Gemini error: ${errText}`, { status: 502, headers: corsHeaders(req) });
    }

    const geminiJson = await geminiRes.json();
    const firstCandidate = geminiJson?.candidates?.[0];
    const inlinePart = firstCandidate?.content?.parts?.find((p: any) => p?.inlineData?.data);
    const base64Image: string | undefined = inlinePart?.inlineData?.data;

    if (!base64Image) {
      return new Response("No image generated.", { status: 500, headers: corsHeaders(req) });
    }

    return new Response(JSON.stringify({ imageUrl: `data:image/png;base64,${base64Image}` }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });
  } catch (err) {
    console.error("Generation error", err);
    return new Response("Server error", { status: 500, headers: corsHeaders(req) });
  }
});
