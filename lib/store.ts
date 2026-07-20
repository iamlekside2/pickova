// Server-only storefront data access. Reads from the DB and maps rows to the
// serializable shapes the (client) components already expect. NEVER import this
// from a client component — fetch in a server component and pass data as props.

import { prisma } from "@/lib/db";
import type { Category, Product, ProductSource } from "@/lib/types";
import { unsplashUrl } from "@/lib/catalog-data";

type DbProduct = {
  id: string;
  name: string;
  price: number;
  images: string;
  affiliateUrl: string;
  rating: number;
  source: string;
  category: { name: string };
  collection: { slug: string } | null;
};

function firstImage(json: string): string {
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && arr.length && typeof arr[0] === "string") return arr[0];
  } catch {
    /* ignore */
  }
  return "";
}

function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: firstImage(p.images),
    affiliateUrl: p.affiliateUrl,
    season: p.collection?.slug ?? "",
    category: p.category.name as Category,
    rating: p.rating,
    source: p.source as ProductSource,
  };
}

const PRODUCT_INCLUDE = {
  category: { select: { name: true } },
  collection: { select: { slug: true } },
} as const;

/** All active products, mapped for the storefront. */
export async function getCatalog(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "asc" },
    include: PRODUCT_INCLUDE,
  });
  return rows.map(mapProduct);
}

export async function getStoreProductById(id: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: PRODUCT_INCLUDE,
  });
  return row ? mapProduct(row) : null;
}

/** Categories that have at least one active product, for tiles + filters. */
export async function getStoreCategories(): Promise<
  { name: string; icon: string; blurb: string }[]
> {
  const rows = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { status: "active" } } } } },
  });
  return rows
    .filter((c) => c._count.products > 0)
    .map((c) => ({ name: c.name, icon: c.icon, blurb: c.blurb }));
}

/** Lightweight index for the navbar search. */
export async function getSearchIndex(): Promise<
  { id: string; name: string; price: number }[]
> {
  const rows = await prisma.product.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true },
  });
  return rows;
}

export type StoreCollection = {
  name: string;
  slug: string;
  emoji: string;
  icon: string;
  heroHeadline: string;
  heroSubtext: string;
  themeFrom: string;
  themeTo: string;
  heroImage: string;
  products: Product[];
};

export async function getCollectionBySlug(slug: string): Promise<StoreCollection | null> {
  const col = await prisma.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
        include: PRODUCT_INCLUDE,
      },
    },
  });
  if (!col) return null;
  return {
    name: col.name,
    slug: col.slug,
    emoji: col.emoji,
    icon: col.icon,
    heroHeadline: col.heroHeadline,
    heroSubtext: col.heroSubtext,
    themeFrom: col.themeFrom,
    themeTo: col.themeTo,
    heroImage: col.heroImage || unsplashUrl("1441986300917-64674bd600d8", 1600, 640),
    products: col.products.map(mapProduct),
  };
}
