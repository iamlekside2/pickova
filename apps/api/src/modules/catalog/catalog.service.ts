import { Prisma } from "@prisma/client";
import {
  MAX_QTY_PER_LINE,
  type CategoryDTO,
  type Paginated,
  type ProductDetailDTO,
  type ProductFacetsDTO,
  type ProductQuery,
  type ProductSummaryDTO,
  type ReviewDTO,
} from "@pickova/shared";
import { notFound } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

export const summarySelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  priceKobo: true,
  compareAtPriceKobo: true,
  isNewArrival: true,
  isBestSeller: true,
  ratingAverage: true,
  reviewCount: true,
  images: { orderBy: { sortOrder: "asc" }, take: 1, select: { id: true, url: true, alt: true, colourId: true } },
  variants: {
    where: { isActive: true },
    select: { colour: { select: { id: true, name: true, hex: true } }, inventory: { select: { quantity: true } } },
  },
} satisfies Prisma.ProductSelect;

type SummaryRow = Prisma.ProductGetPayload<{ select: typeof summarySelect }>;

export function toSummary(p: SummaryRow): ProductSummaryDTO {
  const colours = new Map<string, { id: string; name: string; hex: string }>();
  for (const v of p.variants) colours.set(v.colour.id, v.colour);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    priceKobo: p.priceKobo,
    compareAtPriceKobo: p.compareAtPriceKobo,
    image: p.images[0] ?? null,
    colours: [...colours.values()],
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    inStock: p.variants.some((v) => (v.inventory?.quantity ?? 0) > 0),
    // Ratings only appear once real, approved reviews exist.
    rating: p.reviewCount > 0 ? { average: Math.round(p.ratingAverage * 10) / 10, count: p.reviewCount } : null,
  };
}

function buildWhere(q: ProductQuery): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  for (const slug of q.category ?? []) and.push({ categories: { some: { category: { slug, isActive: true } } } });

  if (q.q) {
    const contains = { contains: q.q, mode: "insensitive" as const };
    and.push({ OR: [{ name: contains }, { brand: contains }, { description: contains }, { sku: contains }] });
  }

  // Size, colour and stock must hold for the *same* variant.
  if (q.size?.length || q.colour?.length || q.inStock) {
    and.push({
      variants: {
        some: {
          isActive: true,
          ...(q.size?.length ? { size: { label: { in: q.size } } } : {}),
          ...(q.colour?.length ? { colour: { name: { in: q.colour, mode: "insensitive" } } } : {}),
          ...(q.inStock ? { inventory: { quantity: { gt: 0 } } } : {}),
        },
      },
    });
  }

  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    and.push({
      priceKobo: {
        ...(q.minPrice !== undefined ? { gte: q.minPrice * 100 } : {}),
        ...(q.maxPrice !== undefined ? { lte: q.maxPrice * 100 } : {}),
      },
    });
  }

  return {
    status: "ACTIVE",
    ...(q.featured ? { isFeatured: true } : {}),
    ...(q.newArrival ? { isNewArrival: true } : {}),
    ...(q.bestSeller ? { isBestSeller: true } : {}),
    // A CHECK constraint guarantees compareAt > price whenever it is set.
    ...(q.onSale ? { compareAtPriceKobo: { not: null } } : {}),
    AND: and,
  };
}

const ORDER_BY: Record<ProductQuery["sort"], Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  "price-asc": [{ priceKobo: "asc" }, { id: "asc" }],
  "price-desc": [{ priceKobo: "desc" }, { id: "asc" }],
  popular: [{ isBestSeller: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }, { id: "asc" }],
};

export async function listProducts(q: ProductQuery): Promise<Paginated<ProductSummaryDTO>> {
  const where = buildWhere(q);
  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: summarySelect,
      orderBy: ORDER_BY[q.sort],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);
  return {
    items: rows.map(toSummary),
    page: q.page,
    pageSize: q.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

const reviewSelect = {
  id: true,
  rating: true,
  title: true,
  body: true,
  isVerifiedPurchase: true,
  createdAt: true,
  user: { select: { firstName: true, lastName: true } },
} satisfies Prisma.ReviewSelect;

type ReviewRow = Prisma.ReviewGetPayload<{ select: typeof reviewSelect }>;

/** Reviewers are shown as "Ada O." — never a full name or email. */
function toReview(r: ReviewRow): ReviewDTO {
  return {
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    author: `${r.user.firstName} ${r.user.lastName.charAt(0).toUpperCase()}.`,
    isVerifiedPurchase: r.isVerifiedPurchase,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getProduct(slug: string): Promise<ProductDetailDTO> {
  const p = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      ...summarySelect,
      sku: true,
      description: true,
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true, colourId: true } },
      categories: { select: { category: { select: { name: true, slug: true, isActive: true, sortOrder: true } } } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          sizeId: true,
          colourId: true,
          priceOverrideKobo: true,
          size: { select: { id: true, label: true, system: true, sortOrder: true } },
          colour: { select: { id: true, name: true, hex: true } },
          inventory: { select: { quantity: true } },
        },
      },
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 20, select: reviewSelect },
    },
  });
  if (!p) throw notFound("We couldn't find that product.");

  const sizes = new Map<string, { id: string; label: string; system: string; sortOrder: number }>();
  for (const v of p.variants) sizes.set(v.size.id, v.size);

  return {
    ...toSummary(p),
    image: p.images[0] ?? null,
    sku: p.sku,
    description: p.description,
    images: p.images,
    sizes: [...sizes.values()].sort((a, b) => a.sortOrder - b.sortOrder).map(({ sortOrder: _s, ...s }) => s),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      sizeId: v.sizeId,
      colourId: v.colourId,
      priceKobo: v.priceOverrideKobo ?? p.priceKobo,
      available: Math.min(v.inventory?.quantity ?? 0, MAX_QTY_PER_LINE),
    })),
    categories: p.categories
      .map((c) => c.category)
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ name, slug: s }) => ({ name, slug: s })),
    reviews: p.reviews.map(toReview),
  };
}

export async function listCategories(): Promise<CategoryDTO[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      _count: { select: { products: { where: { product: { status: "ACTIVE" } } } } },
    },
  });
  return rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }));
}

/** Filter options that actually exist in the live catalogue. */
export async function getFacets(): Promise<ProductFacetsDTO> {
  const live = { variants: { some: { isActive: true, product: { status: "ACTIVE" as const } } } };
  const [categories, sizes, colours, price] = await Promise.all([
    listCategories(),
    prisma.size.findMany({ where: live, orderBy: { sortOrder: "asc" }, select: { id: true, label: true, system: true } }),
    prisma.colour.findMany({ where: live, orderBy: { name: "asc" }, select: { id: true, name: true, hex: true } }),
    prisma.product.aggregate({ where: { status: "ACTIVE" }, _min: { priceKobo: true }, _max: { priceKobo: true } }),
  ]);
  return {
    categories,
    sizes,
    colours,
    price: { minKobo: price._min.priceKobo ?? 0, maxKobo: price._max.priceKobo ?? 0 },
  };
}

/** Latest approved reviews across the store, for the homepage. */
export async function listFeaturedReviews(limit: number): Promise<ReviewDTO[]> {
  const rows = await prisma.review.findMany({
    where: { status: "APPROVED", rating: { gte: 4 }, body: { not: "" }, product: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { ...reviewSelect, product: { select: { name: true, slug: true } } },
  });
  return rows.map((r) => ({ ...toReview(r), product: r.product }));
}
