# Pickova — Deployment

The site is a single Next.js app with no database, backend or secrets, so it runs on a free host.

## Vercel (recommended, free tier)

1. Push this branch to GitHub.
2. In Vercel: **New Project** → import the repository. The framework is detected as Next.js; keep the default build settings.
3. Add one environment variable: `NEXT_PUBLIC_SITE_URL` = your public address (e.g. `https://pickova.com.ng`). It is used for the sitemap and link previews.
4. Deploy, then add your domain under **Settings → Domains**.

Every later push redeploys automatically — that is how product, price and delivery-fee edits in `data/` go live.

> If the old seasonal app is already deployed from this repository's `main` branch, deploying this branch to the same Vercel project replaces it. Its old environment variables (database URL, auth secret, Paystack keys) are no longer used and can be removed.

## Before pointing customers at it

- [ ] `data/store.ts` — WhatsApp number is correct; contact details and social links filled in
- [ ] `data/products.ts` — real products, prices and photos; `sampleCatalogue: false`
- [ ] `data/delivery.ts` — real delivery fees
- [ ] Policy pages reviewed (they show a "Draft for review" notice until the notice is removed in `components/ui/PageHeader.tsx`)
- [ ] `npm test && npm run build` pass
- [ ] Place a test order from a phone and confirm the message arrives on the store's WhatsApp
