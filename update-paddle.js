// Temporary script to update Paddle webhook URL via API (Sandbox).
// Reads PADDLE_API_KEY from .env.local in the project root.

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '.');
const ENV_PATH = path.join(PROJECT_ROOT, '.env.local');
const TARGET_DESCRIPTION = 'Supabase Dev';
const WEBHOOK_URL = 'https://lwyjdmgajwqoohgntnbp.supabase.co/functions/v1/paddle-webhook';
const API_BASE = 'https://sandbox-api.paddle.com';

const parseEnv = () => {
  const raw = fs.readFileSync(ENV_PATH, 'utf8');
  const entries = raw
    .split('\n')
    .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      return [key, value];
    });
  return Object.fromEntries(entries);
};

const env = parseEnv();
const apiKey = env.PADDLE_API_KEY;
if (!apiKey) {
  console.error('PADDLE_API_KEY not found in .env.local');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${apiKey}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const main = async () => {
  console.log('Listing notification settings...');
  const listRes = await fetch(`${API_BASE}/notification-settings`, { headers });
  const listJson = await listRes.json();
  if (!listRes.ok) {
    console.error('List failed:', listJson);
    process.exit(1);
  }
  const target = (listJson.data || []).find((item) => item.description === TARGET_DESCRIPTION);
  if (!target) {
    console.error(`No notification setting found with description "${TARGET_DESCRIPTION}"`);
    process.exit(1);
  }

  const id = target.id;
  console.log(`Found "${TARGET_DESCRIPTION}" with id=${id}, updating destination to ${WEBHOOK_URL} ...`);

  const patchBody = {
    description: TARGET_DESCRIPTION,
    type: target.type || 'url',
    destination: WEBHOOK_URL,
    active: target.active ?? true,
    api_version: target.api_version ?? 1,
    include_sensitive_fields: target.include_sensitive_fields ?? true,
    subscribed_events: (target.subscribed_events || []).map((e) => e.name),
  };

  const patchRes = await fetch(`${API_BASE}/notification-settings/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patchBody),
  });
  const patchJson = await patchRes.json();
  if (!patchRes.ok) {
    console.error('Patch failed:', patchJson);
    process.exit(1);
  }

  console.log('Updated notification setting:', patchJson);
};

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
