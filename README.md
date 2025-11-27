<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set environment in `.env.local` (already filled with sandbox values):
   - `VITE_SUPABASE_URL=https://lwyjdmgajwqoohgntnbp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<anon key>`
   - `VITE_SUPABASE_FUNCTION_URL=https://lwyjdmgajwqoohgntnbp.supabase.co/functions/v1`
   - `VITE_PADDLE_CLIENT_TOKEN=<sandbox client token>`
   - `VITE_PADDLE_ENV=sandbox`
   - (Edge Function only) `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `PADDLE_API_KEY`, `PADDLE_VENDOR_ID`, `PADDLE_PUBLIC_KEY`, `PADDLE_WEBHOOK_SECRET`
3. Run the app:
   `npm run dev`

## Supabase Edge Functions

- `supabase/functions/generate`: wraps Gemini; requires logged-in user (Supabase Auth) and server secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
- `supabase/functions/paddle-webhook`: placeholder to receive Paddle webhooks; add signature verification with `PADDLE_PUBLIC_KEY`/`PADDLE_WEBHOOK_SECRET`.

Deploy functions with Supabase CLI and set secrets in the project settings. Update CORS origins in `generate/index.ts` when you bind your domain (`mdzh.io`, `www.mdzh.io`, or Vercel preview domains).
