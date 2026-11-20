import { CATEGORIES, COLOUR_HEX, PRODUCTS, type ProductSource } from "@/data/products";
import { getDeliveryZone } from "@/data/delivery";
import {
  MAX_QTY_PER_LINE,
  PRODUCT_SORTS,
  type CategoryDTO,
  type Paginated,
  type ProductDetailDTO,
  type ProductFacetsDTO,
  type ProductSort,
  type ProductSummaryDTO,
  type Quote,
  type QuoteLine,
} from "@/lib/shared";

/**
 * The catalogue, built once from data/products.ts. There is no server or
 * database: everything here is plain data, usable on the server and in the
 * browser alike.
 */

export const slugify = (s: string) => s.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const toKobo = (naira: number) => Math.round(naira * 100);
/** Order code for one size of one colour, e.g. AD-SAMBA-WHI-42. */
const variantCode = (sku: string, colour: string, size: string) => `${sku}-${colour.slice(0, 3).toUpperCase()}-${size}`;

function build(source: ProductSource, index: number): ProductDetailDTO & { order: number; isFeatured: boolean; categorySlugs: string[] } {
  const slug = slugify(source.name);
  const colours = source.colours.map((c) => ({ id: c.name, name: c.name, hex: COLOUR_HEX[c.name] ?? "#CCCCCC" }));
  const images = source.colours.flatMap((c) =>
    c.photos.map((file, i) => ({
      id: file,
      url: `/products/${file}`,
      alt: `${source.name}${source.colours.length > 1 ? ` in ${c.name}` : ""}${i > 0 ? ` — view ${i + 1}` : ""}`,
      colourId: c.name,
    })),
  );
  const variants = source.colours.flatMap((c) =>
    source.sizes.map((size) => ({
      id: variantCode(source.sku, c.name, size),
      sku: variantCode(source.sku, c.name, size),
      sizeId: size,
      colourId: c.name,
      priceKobo: toKobo(source.price),
      available: c.soldOut?.includes(size) ? 0 : MAX_QTY_PER_LINE,
    })),
  );
  return {
    id: slug,
    slug,
    name: source.name,
    brand: source.brand || null,
    sku: source.sku,
    description: source.description,
    priceKobo: toKobo(source.price),
    // A "was" price only counts if it really is higher.
    compareAtPriceKobo: source.was && source.was > source.price ? toKobo(source.was) : null,
    image: images[0] ?? null,
    images,
    colours,
    sizes: source.sizes.map((label) => ({ id: label, label, system: "EU" })),
    variants,
    categories: CATEGORIES.filter((c) => source.categories.includes(c.slug)).map((c) => ({ name: c.name, slug: c.slug })),
    categorySlugs: source.categories,
    isNewArrival: source.isNew ?? false,
    isBestSeller: source.bestSeller ?? false,
    isFeatured: source.featured ?? false,
    inStock: variants.some((v) => v.available > 0),
    order: index,
  };
}

const ALL = PRODUCTS.filter((p) => !p.hidden).map(build);
const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));
const VARIANTS = new Map(ALL.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)));

const toSummary = (p: (typeof ALL)[number]): ProductSummaryDTO => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  priceKobo: p.priceKobo,
  compareAtPriceKobo: p.compareAtPriceKobo,
  image: p.image,
  colours: p.colours,
  isNewArrival: p.isNewArrival,
  isBestSeller: p.isBestSeller,
  inStock: p.inStock,
});

export type ProductListParams = {
  q?: string;
  /** comma-separated category slugs; a product must be in ALL of them */
  category?: string;
  size?: string;
  colour?: string;
  minPrice?: number; // naira
  maxPrice?: number; // naira
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

const list = (v: string | undefined) => (v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export function getProducts(params: ProductListParams = {}): Paginated<ProductSummaryDTO> {
  const categories = list(params.category);
  const sizes = list(params.size);
  const colours = list(params.colour);
  const terms = (params.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const sort: ProductSort = PRODUCT_SORTS.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "newest";

  const matches = ALL.filter((p) => {
    if (!categories.every((c) => p.categorySlugs.includes(c))) return false;
    if (terms.length) {
      const haystack = `${p.name} ${p.brand ?? ""} ${p.description} ${p.sku}`.toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    // Size, colour and availability must hold for the same variant.
    if (sizes.length || colours.length || params.inStock) {
      const ok = p.variants.some(
        (v) =>
          (!sizes.length || sizes.includes(v.sizeId.toLowerCase())) &&
          (!colours.length || colours.includes(v.colourId.toLowerCase())) &&
          (!params.inStock || v.available > 0),
      );
      if (!ok) return false;
    }
    if (params.minPrice !== undefined && p.priceKobo < toKobo(params.minPrice)) return false;
    if (params.maxPrice !== undefined && p.priceKobo > toKobo(params.maxPrice)) return false;
    if (params.featured && !p.isFeatured) return false;
    if (params.newArrival && !p.isNewArrival) return false;
    if (params.bestSeller && !p.isBestSeller) return false;
    if (params.onSale && p.compareAtPriceKobo === null) return false;
    return true;
  });

  const sorted = [...matches].sort((a, b) => {
    if (sort === "price-asc") return a.priceKobo - b.priceKobo || a.order - b.order;
    if (sort === "price-desc") return b.priceKobo - a.priceKobo || a.order - b.order;
    if (sort === "popular") return Number(b.isBestSeller) - Number(a.isBestSeller) || a.order - b.order;
    return a.order - b.order;
  });

  const pageSize = Math.min(Math.max(1, Math.trunc(params.pageSize ?? 12)), 48);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(params.page ?? 1)), totalPages);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize).map(toSummary), page, pageSize, total: sorted.length, totalPages };
}

export function getProduct(slug: string): ProductDetailDTO | null {
  return BY_SLUG.get(slug) ?? null;
}

export const getAllProductSlugs = () => ALL.map((p) => p.slug);

export function getCategories(): CategoryDTO[] {
  return CATEGORIES.map((c) => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: null,
    productCount: ALL.filter((p) => p.categorySlugs.includes(c.slug)).length,
  }));
}

/** Filter options that actually exist in the catalogue. */
export function getFacets(): ProductFacetsDTO {
  const sizes = [...new Set(ALL.flatMap((p) => p.sizes.map((s) => s.label)))].sort((a, b) => Number(a) - Number(b));
  const colours = [...new Map(ALL.flatMap((p) => p.colours).map((c) => [c.id, c])).values()].sort((a, b) => a.name.localeCompare(b.name));
  const prices = ALL.map((p) => p.priceKobo);
  return {
    categories: getCategories(),
    sizes: sizes.map((label) => ({ id: label, label, system: "EU" })),
    colours,
    price: { minKobo: prices.length ? Math.min(...prices) : 0, maxKobo: prices.length ? Math.max(...prices) : 0 },
  };
}

/**
 * Prices a cart from the catalogue. Stored cart lines only identify what was
 * picked (variant code + quantity); names, prices and availability always
 * come from the current catalogue, so an old or edited browser copy can never
 * show — or send to WhatsApp — a stale price.
 */
export function quoteCart(items: { variantId: string; quantity: number }[], state?: string | null): Quote {
  const lines: QuoteLine[] = [];
  for (const item of items) {
    const found = VARIANTS.get(item.variantId);
    if (!found) continue; // product or size no longer listed — drop the line
    const { product, variant } = found;
    const quantity = Math.max(1, Math.min(Math.trunc(item.quantity) || 1, MAX_QTY_PER_LINE));
    const image = product.images.find((i) => i.colourId === variant.colourId) ?? product.image;
    const orderable = variant.available > 0;
    lines.push({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sizeLabel: variant.sizeId,
      colourName: variant.colourId,
      imageUrl: image?.url ?? null,
      unitPriceKobo: variant.priceKobo,
      quantity,
      available: variant.available,
      lineTotalKobo: orderable ? variant.priceKobo * quantity : 0,
      issue: orderable ? null : "OUT_OF_STOCK",
    });
  }
  const subtotalKobo = lines.reduce((sum, l) => sum + l.lineTotalKobo, 0);
  const zone = getDeliveryZone(state);
  const deliveryFeeKobo = zone && subtotalKobo > 0 ? toKobo(zone.feeNaira) : null;
  return {
    lines,
    subtotalKobo,
    deliveryFeeKobo,
    totalKobo: subtotalKobo + (deliveryFeeKobo ?? 0),
    orderable: lines.length > 0 && lines.every((l) => l.issue === null),
  };
}
