/**
 * Single place that decides which API this site talks to.
 *
 * NOTE: Next.js only inlines NEXT_PUBLIC_* variables when they are written out literally as
 * `process.env.NEXT_PUBLIC_NAME` (no destructuring, no dynamic keys) — that's why each one is
 * read on its own line below.
 */
const MODE = (process.env.NEXT_PUBLIC_API_MODE || 'test').trim().toLowerCase();

const URLS = {
  test: process.env.NEXT_PUBLIC_API_URL_TEST,
  production: process.env.NEXT_PUBLIC_API_URL_PRODUCTION,
};

if (!(MODE in URLS)) {
  throw new Error(`NEXT_PUBLIC_API_MODE must be "test" or "production" (got "${MODE}"). Check your .env file.`);
}

const selectedUrl = (URLS[MODE] || '').trim().replace(/\/+$/, '');

if (!selectedUrl) {
  throw new Error(
    `NEXT_PUBLIC_API_URL_${MODE.toUpperCase()} is empty. Set it in your .env file (currently using API mode "${MODE}").`,
  );
}

export const API_MODE = MODE;
export const API_BASE_URL = `${selectedUrl}/api/v1`;

export const BRAND_NAME = (process.env.NEXT_PUBLIC_BRAND_NAME || 'Your Transfers').trim();
// Optional agent this site's bookings are for (see .env.example). Sent with every booking.
export const AGENT_EMAIL = (process.env.NEXT_PUBLIC_AGENT_EMAIL || '').trim().toLowerCase();
export const AGENT_NAME = (process.env.NEXT_PUBLIC_AGENT_NAME || '').trim();
export const DEFAULT_RATE_TAG = (process.env.NEXT_PUBLIC_DEFAULT_RATE_TAG || '').trim().toLowerCase();
