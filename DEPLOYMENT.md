# Pickova — Deployment Guide

This takes Pickova from local (SQLite + mock payments) to a live production site on
**Vercel + Neon Postgres + Paystack**. The app is already production-ready — a clean
`next build` passes. Going live is configuration, not code.

> **Time estimate:** ~30–45 minutes for a first deploy.

---

## 0. What you'll need (accounts)

| Service | Purpose | Required? |
|---|---|---|
| [Neon](https://neon.tech) | Postgres database (free tier) | **Yes** |
| [Vercel](https://vercel.com) | Hosting (free tier) | **Yes** |
| [Paystack](https://paystack.com) | Payments | **Yes** (test keys to start) |
| [Bright Data](https://brightdata.com) | Import from protected retailers | Optional |
| [Cloudinary](https://cloudinary.com) | Image uploads (currently URL-only) | Optional |

Push the repo to GitHub first (Vercel deploys from Git).

---

## 1. Create the Postgres database (Neon)

1. Create a Neon project → copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).
2. Keep it handy — it becomes `DATABASE_URL`.

---

## 2. Switch Prisma from SQLite to Postgres

In **`prisma/schema.prisma`**, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

That's the only code change. The schema was written to be Postgres-portable
(lists stored as `Json` strings, statuses as strings — no SQLite-only features),
so nothing else needs editing.

Then create the schema on Neon and seed it (run locally with `DATABASE_URL`
pointed at Neon, or from a one-off shell):

```bash
# point DATABASE_URL at your Neon string first (e.g. in .env)
npx prisma db push        # creates all tables on Neon
npm run db:seed           # loads categories, collections, sample catalogue + admin user
```

> The seed also creates the **admin user** from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
> Set those to your real values **before** seeding.

> Prefer versioned migrations for production? Use `npx prisma migrate deploy`
> with a committed `prisma/migrations` folder instead of `db push`. `db push` is
> fine to launch.

---

## 3. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (and locally
in `.env` for the seed step). See `.env.example` for the full list.

### Required
```
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require"
AUTH_SECRET="<a long random string>"          # generate: openssl rand -hex 32
ADMIN_EMAIL="you@yourdomain.com"
ADMIN_PASSWORD="<a strong password>"
NEXT_PUBLIC_SITE_URL="https://your-domain.com" # your real deployed URL
NEXT_PUBLIC_PAYSTACK_KEY="pk_test_…"           # Paystack public key
PAYSTACK_SECRET_KEY="sk_test_…"                # Paystack secret key
NEXT_PUBLIC_WHATSAPP_NUMBER="234803XXXXXXX"    # order-enquiry WhatsApp number
```

### Optional
```
BRIGHTDATA_API_KEY="…"          # enables the "Bright Data" import option
BRIGHTDATA_ZONE="web_unlocker1" # your Web Unlocker zone name
NEXT_PUBLIC_JUMIA_AFFILIATE_ID="…"
```

> **Payments go live automatically** once `PAYSTACK_SECRET_KEY` is a real
> `sk_test_`/`sk_live_` key. While it's the placeholder, checkout runs in **mock
> mode** (orders are created + auto-marked paid, no real charge).

---

## 4. Deploy to Vercel

1. Vercel → **New Project** → import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build command stays
   `npm run build` (it runs `prisma generate` first — already configured).
3. Add the environment variables from step 3.
4. Deploy. Note the assigned URL and set `NEXT_PUBLIC_SITE_URL` to it (redeploy if
   you added it after the first build).

---

## 5. Configure the Paystack webhook

Payments are confirmed by webhook (the authoritative source of truth).

1. Paystack Dashboard → **Settings → API Keys & Webhooks**.
2. Set the **Webhook URL** to:
   ```
   https://your-domain.com/api/webhooks/paystack
   ```
3. Save. The endpoint verifies Paystack's HMAC-SHA512 signature and marks orders
   paid, then auto-forwards them to suppliers.

> **Test-mode note:** Paystack can't reach `localhost`. To test webhooks locally,
> tunnel with ngrok/cloudflared and use that public URL. In production, your
> Vercel URL works directly.

---

## 6. First login & smoke test

1. Go to `https://your-domain.com/admin/login` → sign in with `ADMIN_EMAIL` /
   `ADMIN_PASSWORD`.
2. **Change the admin password** (or reseed with a new one) — the seed value is a
   starting credential.
3. Storefront smoke test:
   - Home loads with products, categories, search.
   - Add to cart → checkout → pay with a Paystack **test card**
     (`4084 0840 8408 4081`, any future expiry, any CVV).
   - Order appears in `/admin/orders` as **Paid → Forwarded**, with a supplier
     order in the fulfilment queue.

---

## 7. Turn on the real dropshipping workflow

1. **Suppliers** (`/admin/suppliers`) — add your real suppliers. Set the adapter:
   - `manual` → orders land in the admin queue for you to place by hand.
   - `generic-rest` → set the API base URL to auto-forward orders.
2. **Markup** (`/admin/settings`) — set your default markup %; every imported
   product's sell price is computed from cost + markup (per-product override on
   the product form).
3. **Import products** (`/admin/products/import`) — paste a product URL. For
   protected retailers (Amazon, AliExpress, Jumia), set `BRIGHTDATA_API_KEY` and
   choose the **Bright Data** fetch method.

---

## 8. Known limitations / next steps

- **Images:** products take image **URLs** for now. To add drag-and-drop uploads,
  wire Cloudinary (unsigned upload preset) into the product/import forms — the
  data model already stores an image array.
- **Caching:** storefront pages are `force-dynamic` (always fresh, no caching).
  Fine to launch; for higher traffic, add `revalidate` / on-demand revalidation
  so admin edits still propagate quickly without hitting the DB every request.
- **Migrations:** currently `db push`. Adopt `prisma migrate` before you have real
  data you can't lose.
- **Bright Data import:** built and wired, but not yet exercised against a live
  scrape — verify with your key after deploy.

---

## Quick reference — commands

```bash
npm run dev        # local dev (port 3009)
npm run build      # production build (prisma generate + next build)
npm run db:push    # sync schema to the database
npm run db:seed    # seed categories/collections/catalogue/admin
npm run db:studio  # browse the database (Prisma Studio)
npm run db:reset   # wipe + reseed (destructive)
```
