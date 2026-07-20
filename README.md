# Pickova — Seasonal Shopping Platform

Nigerian seasonal shopping & dropshipping storefront. **"Pick the moment. Own the season."**

Built from the Pickova design handoff (homepage + logo system).

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (brand tokens in `tailwind.config.ts`)
- **lucide-react** — all UI icons
- **react-icons** — social / brand icons only (WhatsApp, Instagram, X, TikTok, Facebook)
- **Paystack** — checkout (env-configured; integration hook ready)
- Deployable on **Vercel**

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3009
```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PAYSTACK_KEY` | Paystack public key for checkout |
| `NEXT_PUBLIC_JUMIA_AFFILIATE_ID` | Appended to affiliate product links |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Store WhatsApp number (intl format, no `+`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata |

## Structure

```
app/
  layout.tsx                 # fonts, metadata, CartProvider, Navbar/Footer/CartDrawer
  page.tsx                   # homepage (hero slider, season tabs, grid, trending, countdown, newsletter)
  not-found.tsx
  seasons/[slug]/page.tsx    # per-season storefront (static-generated)
  products/[id]/page.tsx     # product detail (static-generated) + AddToBasketButton
components/
  Navbar · HeroSection · SeasonTabs · ProductGrid · ProductCard
  TrustBar · CountdownTimer · Newsletter · Footer · WhatsAppButton
  CartProvider · CartDrawer · Logo · ImagePlaceholder
lib/
  types.ts · seasons.ts · jumia.ts · format.ts
public/
  logo.svg
```

## Notes

- **Seasons & products** come from `lib/seasons.ts`. The 5 handoff seasons (Detty
  December, Christmas, Valentine, Back to School, Ramadan) use the design's exact copy
  and catalogue; Black Friday and Everyday Picks are authored in the same voice.
- The homepage auto-selects the **current season** by month and the hero **autoplays**
  every 5s (paused on hover / disabled under `prefers-reduced-motion`).
- **Cart** persists in `localStorage`; the mini-drawer offers WhatsApp checkout.
- **Photography is placeholder** — `ImagePlaceholder` renders season-tinted tiles until
  real product photos are sourced (see handoff).
- Icons follow the project rules: `lucide-react` for UI, `react-icons` for brand/social,
  **no emoji as functional icons**.
