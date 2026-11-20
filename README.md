# Pickova — Pick your pair.

Nigerian sneaker and casual-footwear store. A Next.js storefront, an Express REST API and a PostgreSQL database, kept cleanly separate.

```
pickova/
├─ apps/
│  ├─ web/        Next.js 14 (App Router) · React · TypeScript · Tailwind — the storefront
│  └─ api/        Express 5 · TypeScript · Prisma · PostgreSQL — the REST API  (/api/v1)
├─ packages/
│  └─ shared/     Zod schemas, constants and API types used by both apps
└─ scripts/       local-db.mjs — starts/stops the local development Postgres
```

## Getting started

Requires Node 20+ and PostgreSQL 14+ installed locally (only the binaries are used).

```bash
npm install
npm run db:start                     # local Postgres on 127.0.0.1:5433 (data in ./.pgdata)
cp apps/api/.env.example apps/api/.env      # then set JWT_SECRET
cp apps/web/.env.example apps/web/.env.local
npm run db:migrate                   # create the schema
npm run db:seed                      # reference data + SAMPLE catalogue
npm run dev                          # API on :4000, storefront on :3009
```

Open http://localhost:3009.

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Run API and storefront together |
| `npm run typecheck` | TypeScript across every workspace |
| `npm run lint` | ESLint across every workspace |
| `npm test` | API integration tests (uses the separate `pickova_test` database) |
| `npm run build` | Production builds |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:studio` | Browse the database |

## How it fits together

- **The browser only talks to the storefront origin.** `apps/web` proxies `/api/v1/*` to the API (`next.config.mjs`), so the session cookie is first-party and there is no cross-origin traffic. Server components call the API directly via `API_URL`.
- **Money is integer kobo** everywhere (`priceKobo`, `totalKobo`). `formatNaira()` in `@pickova/shared` is the only place it becomes a string.
- **Stock is per size × colour** (`ProductVariant` → `Inventory`). The database itself refuses negative stock.
- **The cart is never trusted.** The browser stores variant ids and quantities; `POST /api/v1/cart/quote` re-prices everything from the database (price, stock, delivery fee, coupon). Checkout builds orders from the same function.
- **Auth** is a signed JWT in an HTTP-only, SameSite=Lax cookie. Each request re-checks the user, so deactivating an account or bumping `tokenVersion` ends sessions immediately. Roles: `CUSTOMER`, `STAFF`, `ADMIN`.

## The sample catalogue

`npm run db:seed` loads 19 **sample** listings (Nike, Adidas, Jordan, New Balance, Converse, Puma, Vans) so the store can be designed and tested. The photos are real sneakers from Unsplash's free licence (`apps/web/public/products`, sources in `SOURCES.md` there); the names, prices and stock are placeholders. They are not Pickova inventory, and while the `sampleCatalogue` setting is on the storefront shows a "Preview store" notice. Before launch: add real products and photos, then remove the samples and switch the setting off. Seed a real store without samples using `SEED_SAMPLE_CATALOGUE=false`.

## Status

| Phase | Scope | State |
| --- | --- | --- |
| 1 | Foundation — monorepo, schema, migrations, API, design system | Done |
| 2 | Storefront — homepage, catalogue, collections, product pages, search & filters | Done |
| 3 | Accounts — password reset, dashboard, orders, addresses, profile, wishlist & cart saved to the account | Done |
| 4 | Checkout — Paystack initialise/verify/webhooks, order confirmation | Next |
| 5 | Admin dashboard | Planned |
| 6 | Production hardening, SEO, deployment | Planned |

The previous seasonal-dropshipping app lives on the `main` branch.
