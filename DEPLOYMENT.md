# Pickova — Deployment notes

> Full production guide is written in **Phase 6**. This page records what is already true so nothing is deployed by accident.

## What runs where

| Piece | What it is | Needs |
| --- | --- | --- |
| `apps/web` | Next.js storefront (Node server, not a static export) | `API_URL`, `NEXT_PUBLIC_SITE_URL` |
| `apps/api` | Express REST API | `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN` (+ `COOKIE_DOMAIN` if on its own subdomain) |
| Database | PostgreSQL 14+ | Apply with `npm run db:deploy -w @pickova/api` (never `migrate dev` in production) |

The browser only talks to the storefront; it proxies `/api/v1/*` to the API. The simplest production layout is therefore the API on a private/internal address and the storefront as the only public site.

## Before any production deploy

1. **Use a new, empty database.** The Supabase database referenced by the old root `.env` belongs to the previous seasonal-dropshipping app on `main`. Its tables are incompatible — do not point this app's `DATABASE_URL` at it.
2. Generate a real `JWT_SECRET` (48+ random bytes) and set `NODE_ENV=production` (turns on `Secure` cookies and hides error details).
3. Seed with `SEED_SAMPLE_CATALOGUE=false` and real `ADMIN_EMAIL` / `ADMIN_PASSWORD`, or remove the sample products and switch off the `sampleCatalogue` setting.
4. Fill in contact details, social links and delivery fees (Store Settings — Phase 5; until then, the `StoreSetting` and `DeliveryZone` tables).
5. Have the policy pages (Shipping & Returns, Privacy, Terms, FAQ) reviewed; they are marked "Draft for review".
6. Checkout is not live until Phase 4 (Paystack keys + webhook URL `https://<api-host>/api/v1/webhooks/paystack`).

## Build

```bash
npm ci
npm run build          # prisma generate + API bundle (apps/api/dist) + Next build
npm run start -w @pickova/api
npm run start -w @pickova/web
```
