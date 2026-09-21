# Transfer Booking — Customer Website (Next.js)

The customer-facing site for the Transfer Booking API:

- **Landing page** — header, hero with the search box (pickup, drop-off, date, passengers, live price), a rates section and a "why us" section.
- **Booking page** — the booking form on the left and a live order summary on the right. After submitting you get a confirmation screen with the booking reference.

It uses exactly **two** API endpoints: `GET /rates` and `POST /bookings`.

Colours: `#CDA35B` (gold) and `#070D0B` (black) — defined once at the top of `src/app/globals.css`.

---

## 1. Run it

Requirements: **Node 20.9+** and the API running (see the backend README).

```bash
npm install
npm run dev          # http://localhost:3000
```

`.env.local` is already included and points at `http://localhost:4000` (the API's default port).
Production build: `npm run build && npm start`.

## 2. Switching between the TEST and PRODUCTION API — `.env.local`

Everything about the API address lives in one file:

```env
NEXT_PUBLIC_API_MODE=test                              # test | production   <-- the switch
NEXT_PUBLIC_API_URL_TEST=http://localhost:4000
NEXT_PUBLIC_API_URL_PRODUCTION=https://api.yourdomain.com
```

- Change `NEXT_PUBLIC_API_MODE` to flip between the two URLs. Edit the URLs when your servers change.
- Write the URL **without** a trailing slash and **without** `/api/v1` (it is added for you).
- **Restart `npm run dev` after editing** (or rebuild/redeploy). Variables starting with `NEXT_PUBLIC_` are baked into the code when Next.js starts/builds, they are not read live.
- A wrong mode or an empty URL stops the build/start with a clear message instead of failing silently.

Other settings in the same file:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BRAND_NAME` | Name shown in the header, footer and page titles |
| `NEXT_PUBLIC_DEFAULT_RATE_TAG` | Optional. Show only the rates with this agent tag. Leave empty to show all rates. A single link can override it: `https://book.yourdomain.com/?tag=omar` |

## 3. Backend setting you must not forget: CORS

The browser calls the API directly, so the API must allow this site's origin. In the **backend** `.env`:

```env
CORS_ORIGINS=http://localhost:3000,https://book.yourdomain.com
```

Exact origins, no trailing slash, then restart the API. If you see a CORS error in the browser console, this is the cause.
(The browser calls the API directly on purpose: the API's per-IP rate limits then see each customer's real IP instead of your hosting provider's.)

## 4. Deploy on Vercel (subdomain)

1. Push the project to GitHub and import it in Vercel (framework: Next.js, root directory = this folder).
2. **Settings → Environment Variables**: add the same `NEXT_PUBLIC_*` variables. For live use set `NEXT_PUBLIC_API_MODE=production` and the real `NEXT_PUBLIC_API_URL_PRODUCTION`.
3. **Settings → Domains**: add `book.yourdomain.com`, then create the DNS record Vercel shows (a CNAME).
4. Add `https://book.yourdomain.com` to the API's `CORS_ORIGINS`.
5. Changing an environment variable later requires a **redeploy** (see the note in section 2).

## 5. How it works

**Landing page (`/`)** is rendered on the server, which fetches the rates (cached for 60 seconds) so the page is fast and the dropdowns are ready immediately.
The hero search box (`SearchWidget`) is interactive: choosing a pickup fills the drop-off list with only the destinations that exist for it; choosing both shows the price; **Continue** opens
`/booking?rateId=…&date=…&passengers=…`.

**Booking page (`/booking`)** looks up the chosen rate by `rateId`, shows the form and summary side by side (stacked on phones), and posts to `POST /bookings`.
The price shown on screen is a preview: the API recalculates it from its own database, and the confirmation screen shows the price the **server** stored.

**Errors** from the API are shown next to the field they belong to (for example "Bookings must be made at least 12 hours before pickup" appears under the time field). If the API is down, pages show a friendly message instead of crashing.

## 6. What is where

```
.env.local / .env.example   API URLs, mode switch, brand name, optional rate tag
src/
├── app/
│   ├── layout.js           HTML shell, page title, theme colour
│   ├── page.js             Landing page (fetches rates on the server)
│   ├── booking/page.js     Booking page (finds the chosen rate, renders BookingFlow)
│   ├── globals.css         ALL styling; brand colours at the top
│   └── icon.svg            Favicon
├── components/
│   ├── Header.js           Sticky header + mobile menu
│   ├── Footer.js
│   ├── SearchWidget.js     Hero search: dropdowns, date, passengers, price, "Continue"
│   ├── RatesSection.js     "Our transfer rates" cards (each pre-fills the search box)
│   ├── BookingFlow.js      Form + validation + POST /bookings + confirmation screen
│   ├── BookingSummary.js   Order summary card (live as the form changes)
│   └── Icons.js            Inline SVG icons
└── lib/
    ├── config.js           Reads .env and picks the API URL (test / production)
    ├── api.js              The only two API calls: fetchRates(), createBooking()
    ├── pricing.js          Price preview (mirrors the API's maths)
    ├── validation.js       Form validation (mirrors the API's rules)
    └── format.js           Money and date formatting
```

## 7. Customising

- **Colours:** `--gold` and `--ink` at the top of `src/app/globals.css`.
- **Wording:** hero text and the "why us" section are in `src/app/page.js`.
- **Fonts:** the heading font falls back to Georgia. To use Google fonts, load them with `next/font/google` in `layout.js` and set `--font-display` / `--font-body`.
- **Logo:** replace the round monogram in `Header.js` with an `<Image>`, and replace `src/app/icon.svg`.

## 8. What was verified

Built with `next build` (Next.js 16) and tested against the real backend on a MongoDB-compatible database: server-rendered pages with live rates, the booking page with the chosen rate and prefilled date/passengers, and behaviour when the API is unreachable or the environment is misconfigured. Interactive tests (jsdom) covered the dependent dropdowns, price preview, passenger limits, validation messages, a real booking created through the API (checked in the database), and a server-side rule error shown on the correct field.
**Not verified:** the visual layout in real browsers (no browser was available where I built it), so please check the design on desktop and phone and tell me what to adjust.
