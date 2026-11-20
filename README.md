# Pickova — Pick your pair.

Nigerian sneaker and casual-footwear storefront. Customers browse, build a cart, and **send their order to the store on WhatsApp**. There is no backend, database, login or online payment — the whole site is a Next.js app that can be hosted for free.

## Getting started

Requires Node 20+.

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3009
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the site locally |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (catalogue data, filters, cart totals, WhatsApp message) |
| `npm run build` | Production build |

## Running the store — the three files you edit

Everything the owner changes lives in `data/`. Edit, commit, and the host redeploys.

| File | What it controls |
| --- | --- |
| `data/store.ts` | WhatsApp number that receives orders, contact details, social links, the top announcement bar, the homepage promo banner, and the `sampleCatalogue` switch |
| `data/products.ts` | Every product: name, brand, price, "was" price, categories, sizes, colours, photos, sold-out sizes, and the New / Best Seller / Featured flags |
| `data/delivery.ts` | Estimated delivery fee and timeline per state |

Product photos go in `public/products/`. `npm test` checks that every photo named in `data/products.ts` exists, that "was" prices are higher than prices, and that order codes are unique — run it after editing.

### Marking a size as sold out

```ts
colours: [{ name: "White", photos: ["adidas-samba-white-1.jpg"], soldOut: ["38", "44"] }],
```

Sold-out sizes are greyed out and cannot be added to the cart.

## How an order works

1. The customer picks a colour and size (a size is required) and adds pairs to the cart. The cart is saved in their browser.
2. On the cart page they enter name, phone, state, city and address. The cart shows an estimated delivery fee for the state.
3. **Order on WhatsApp** opens a chat with the store's number with the order already written out — items, order codes (e.g. `AD-SAMBA-WHI-42`), totals and delivery details. The customer presses send.
4. The store replies in the chat to confirm availability, the exact delivery fee and how to pay.

Prices in the cart and in the message always come from `data/products.ts` at that moment; the browser only remembers *which* items were chosen.

## Layout

```
app/          pages (Next.js App Router)
components/   UI (brand, layout, home, product, shop, cart)
data/         store settings, products, delivery fees   ← edit these
lib/          catalogue logic (lib/catalog.ts), WhatsApp message (lib/whatsapp.ts)
stores/       cart and wishlist kept in the browser
public/       product photos and brand images
tests/        unit tests
```

## What this version does not have

No customer accounts, order history or tracking, coupons, live stock counts, online payment, or admin dashboard. Stock is whatever `data/products.ts` says; orders live in the store's WhatsApp.

The full-stack version (Express API, PostgreSQL, accounts, and an unfinished Paystack checkout) is preserved in git at commit `291efe9` on this branch. The original seasonal-dropshipping app is on `main` and, locally, in `legacy/`.

## Before launch

- Replace the sample listings and stock photos with real products, prices and photos, then set `sampleCatalogue: false` in `data/store.ts`.
- Set real delivery fees in `data/delivery.ts`.
- Review the Shipping & Returns, Privacy, Terms and FAQ pages (marked "Draft for review").
