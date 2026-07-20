import type { Product, Season } from "./types";
import { buildAffiliateUrl } from "./jumia";
import {
  COLLECTION_DATA,
  COLLECTION_HERO_IMAGES,
  deriveProductMeta,
  unsplashUrl,
} from "./catalog-data";
import { resolveIcon } from "./icons";

// Re-exported so existing imports of `unsplashUrl` from "@/lib/seasons" keep working.
export { unsplashUrl } from "./catalog-data";

type RawProduct = { name: string; price: number; category: Product["category"] };

function buildProduct(raw: RawProduct, seasonSlug: string, index: number): Product {
  const meta = deriveProductMeta(raw, seasonSlug, index);
  return {
    id: meta.id,
    name: raw.name,
    price: raw.price,
    image: meta.image,
    affiliateUrl: buildAffiliateUrl(raw.name, meta.source),
    season: seasonSlug,
    category: raw.category,
    rating: meta.rating,
    source: meta.source,
  };
}

export const SEASONS: Season[] = COLLECTION_DATA.map((raw) => {
  const products = raw.products.map((p, i) => buildProduct(p, raw.slug, i));
  const categories = Array.from(new Set(products.map((p) => p.category)));
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    emoji: raw.emoji,
    icon: resolveIcon(raw.icon),
    active: false, // set per-request by getCurrentSeasonIndex consumers
    startMonth: raw.months[0],
    endMonth: raw.months[raw.months.length - 1],
    heroHeadline: raw.heroHeadline,
    heroSubtext: raw.heroSubtext,
    heroImage: COLLECTION_HERO_IMAGES[raw.slug]
      ? unsplashUrl(COLLECTION_HERO_IMAGES[raw.slug], 1600, 640)
      : "",
    themeFrom: raw.themeFrom,
    themeTo: raw.themeTo,
    categories,
    products,
  };
});

// Internal month lookup kept alongside SEASONS order.
const SEASON_MONTHS: number[][] = COLLECTION_DATA.map((r) => r.months);

/** All products across every season (used by product detail lookup). */
export const ALL_PRODUCTS: Product[] = SEASONS.flatMap((s) => s.products);

/** Neutral brand theme for placeholders when no season context applies. */
export const NEUTRAL_THEME = { themeFrom: "#0A6640", themeTo: "#0d7a4d" };

/**
 * Season-agnostic catalogue: every product deduped by name, so the neutral
 * (non-seasonal) storefront shows a clean cross-category selection without the
 * same item repeating across seasons. Order follows season declaration order.
 */
export const CATALOG: Product[] = (() => {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of ALL_PRODUCTS) {
    const key = p.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
})();

export function getSeasonBySlug(slug: string): Season | undefined {
  return SEASONS.find((s) => s.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getSeasonForProduct(product: Product): Season | undefined {
  return getSeasonBySlug(product.season);
}

/**
 * Index of the season that is "in season" for the given month (1-based).
 * December overlaps Detty December + Christmas — Detty December wins because
 * it is listed first. Falls back to Everyday Picks if nothing matches.
 */
export function getCurrentSeasonIndex(month: number): number {
  const specific = SEASON_MONTHS.findIndex(
    (months, i) => SEASONS[i].slug !== "everyday" && months.includes(month),
  );
  if (specific !== -1) return specific;
  const everyday = SEASONS.findIndex((s) => s.slug === "everyday");
  return everyday === -1 ? 0 : everyday;
}

/**
 * The next upcoming season's start date relative to `from`, for the countdown.
 */
export function getNextSeasonStart(from: Date): { season: Season; date: Date } {
  const currentIndex = getCurrentSeasonIndex(from.getMonth() + 1);
  const currentSlug = SEASONS[currentIndex].slug;

  for (let ahead = 1; ahead <= 12; ahead++) {
    const probe = new Date(from.getFullYear(), from.getMonth() + ahead, 1);
    const idx = getCurrentSeasonIndex(probe.getMonth() + 1);
    if (SEASONS[idx].slug !== currentSlug && SEASONS[idx].slug !== "everyday") {
      return { season: SEASONS[idx], date: probe };
    }
  }
  const fallback = new Date(from.getFullYear() + 1, from.getMonth(), 1);
  return { season: SEASONS[currentIndex], date: fallback };
}
