// Pure catalog data — NO framework/React imports, so it is safe to import from
// both the client bundle and Node scripts (the Prisma seed). Icon fields are
// plain strings resolved to components via lib/icons.ts on the client.

import type { Category, ProductSource } from "./types";

export type SeedCategory = {
  name: Category;
  slug: string;
  icon: string;
  blurb: string;
  sortOrder: number;
};

export const CATEGORY_DATA: SeedCategory[] = [
  { name: "Fashion", slug: "fashion", icon: "Shirt", blurb: "Fits, shoes & accessories", sortOrder: 1 },
  { name: "Electronics", slug: "electronics", icon: "Smartphone", blurb: "Gadgets & gear", sortOrder: 2 },
  { name: "Home", slug: "home", icon: "Home", blurb: "Comfort for your space", sortOrder: 3 },
  { name: "Beauty", slug: "beauty", icon: "Sparkles", blurb: "Glow & self-care", sortOrder: 4 },
  { name: "Grocery", slug: "grocery", icon: "ShoppingBasket", blurb: "Everyday essentials", sortOrder: 5 },
  { name: "Kids", slug: "kids", icon: "Baby", blurb: "For the young ones", sortOrder: 6 },
];

export type SeedRawProduct = { name: string; price: number; category: Category };

export type SeedCollection = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  icon: string;
  months: number[];
  heroHeadline: string;
  heroSubtext: string;
  themeFrom: string;
  themeTo: string;
  products: SeedRawProduct[];
};

// Product photography and catalogue are placeholders in the handoff; copy,
// prices and product names below are the design's source of truth.
export const COLLECTION_DATA: SeedCollection[] = [
  {
    id: "detty",
    slug: "detty-december",
    name: "Detty December",
    emoji: "🎉",
    icon: "Star",
    months: [12],
    heroHeadline: "December Don Enter, Pick Am Correct",
    heroSubtext:
      "Party fit, speaker, gele — everything you need for detty december na here.",
    themeFrom: "#0A6640",
    themeTo: "#0F8A5A",
    products: [
      { name: "Sequin Party Dress", price: 16500, category: "Fashion" },
      { name: "Ankara Streetwear Fit", price: 13000, category: "Fashion" },
      { name: "Bluetooth Party Speaker", price: 25000, category: "Electronics" },
      { name: "Gele Head Wrap Set", price: 5500, category: "Fashion" },
      { name: "Makeup Glam Kit", price: 17500, category: "Beauty" },
      { name: "Portable Cooler Box", price: 12800, category: "Home" },
      { name: "LED Party Lights Kit", price: 6200, category: "Home" },
      { name: "Sunglasses Pack", price: 4500, category: "Fashion" },
    ],
  },
  {
    id: "christmas",
    slug: "christmas",
    name: "Christmas",
    emoji: "🎄",
    icon: "Gift",
    months: [12],
    heroHeadline: "Ho-Ho-Owambe Season Don Land",
    heroSubtext:
      "From gele to gift wrap — we don pick the best Xmas drops for you, no stress.",
    themeFrom: "#0A6640",
    themeTo: "#0d7a4d",
    products: [
      { name: "Ankara Xmas Family Set", price: 15000, category: "Fashion" },
      { name: "LED Fairy Lights Pack", price: 4500, category: "Home" },
      { name: "Turkey Marinade Kit", price: 6200, category: "Grocery" },
      { name: "Owambe Party Shoes", price: 12000, category: "Fashion" },
      { name: "Bluetooth Speaker Mini", price: 14500, category: "Electronics" },
      { name: "Xmas Hamper Basket", price: 9800, category: "Grocery" },
      { name: "Kids Santa Costume", price: 6500, category: "Kids" },
      { name: "Rechargeable Lantern", price: 7200, category: "Electronics" },
    ],
  },
  {
    id: "valentine",
    slug: "valentine",
    name: "Valentine",
    emoji: "❤️",
    icon: "Heart",
    months: [2],
    heroHeadline: "Love Dey Sweet, Make Your Pocket Sweet Too",
    heroSubtext:
      "Skip the wahala. We don pick fine gifts your person go love, no forming.",
    themeFrom: "#8a1f3d",
    themeTo: "#b5294f",
    products: [
      { name: "Rose & Chocolate Gift Box", price: 8500, category: "Grocery" },
      { name: "Matching Couples Hoodie Set", price: 18000, category: "Fashion" },
      { name: "Perfume Duo Pack", price: 22000, category: "Beauty" },
      { name: "Love Letter Card Pack", price: 2500, category: "Home" },
      { name: "Skincare Gift Set", price: 15500, category: "Beauty" },
      { name: "Bluetooth Earbuds", price: 19000, category: "Electronics" },
      { name: "Teddy Bear Bouquet", price: 9000, category: "Home" },
      { name: "Date Night Candle Set", price: 5200, category: "Home" },
    ],
  },
  {
    id: "school",
    slug: "back-to-school",
    name: "Back to School",
    emoji: "📚",
    icon: "GraduationCap",
    months: [9],
    heroHeadline: "New Term, New Vibe",
    heroSubtext:
      "Books, bags, and bragging rights — we don sort everything for resumption.",
    themeFrom: "#0A4E8A",
    themeTo: "#1668b0",
    products: [
      { name: "Backpack Combo Set", price: 11000, category: "Fashion" },
      { name: "Stationery Bundle", price: 3500, category: "Home" },
      { name: "Insulated Lunch Box Set", price: 4000, category: "Home" },
      { name: "Uniform Fabric Pack", price: 9500, category: "Fashion" },
      { name: "Kids Sneakers", price: 8200, category: "Kids" },
      { name: "Rechargeable Study Lamp", price: 6800, category: "Electronics" },
      { name: "Calculator & Geometry Set", price: 3200, category: "Electronics" },
      { name: "Water Bottle Pack", price: 2800, category: "Kids" },
    ],
  },
  {
    id: "ramadan",
    slug: "ramadan",
    name: "Ramadan",
    emoji: "🌙",
    icon: "Moon",
    months: [3, 4],
    heroHeadline: "Ramadan Kareem, We Dey Support Your Iftar",
    heroSubtext:
      "From date box to prayer mat — we don pick the essentials for the season.",
    themeFrom: "#1a4d3a",
    themeTo: "#2c6b52",
    products: [
      { name: "Iftar Date Box", price: 4800, category: "Grocery" },
      { name: "Prayer Mat Set", price: 7200, category: "Home" },
      { name: "Modest Abaya", price: 14000, category: "Fashion" },
      { name: "Sahur Meal Kit", price: 6000, category: "Grocery" },
      { name: "Hijab Pack", price: 5800, category: "Fashion" },
      { name: "Rechargeable Fan", price: 9200, category: "Electronics" },
      { name: "Dates & Nuts Hamper", price: 8600, category: "Grocery" },
      { name: "Home Fragrance Set", price: 5400, category: "Home" },
    ],
  },
  {
    id: "black-friday",
    slug: "black-friday",
    name: "Black Friday",
    emoji: "⚡",
    icon: "Zap",
    months: [11],
    heroHeadline: "Black Friday Don Burst, Grab Am Sharp",
    heroSubtext:
      "Prices don fall well well. Pick am before e finish — na who dey fast dey chop.",
    themeFrom: "#0B0B0B",
    themeTo: "#2a2a2a",
    products: [
      { name: 'Smart LED TV 43"', price: 145000, category: "Electronics" },
      { name: "Wireless Earbuds Pro", price: 19500, category: "Electronics" },
      { name: "Air Fryer 5L", price: 42000, category: "Home" },
      { name: "Designer Sneakers", price: 22000, category: "Fashion" },
      { name: "Perfume Gift Set", price: 17000, category: "Beauty" },
      { name: "Blender & Grinder Combo", price: 28000, category: "Home" },
      { name: "Kids Smart Watch", price: 12500, category: "Kids" },
      { name: "Power Bank 30000mAh", price: 14000, category: "Electronics" },
    ],
  },
  {
    id: "everyday",
    slug: "everyday",
    name: "Everyday Picks",
    emoji: "🔥",
    icon: "Flame",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    heroHeadline: "Everyday Correct Picks, Any Day Any Time",
    heroSubtext:
      "The things wey dey always sell out — restocked and ready for your gbeddu.",
    themeFrom: "#0A6640",
    themeTo: "#0d7a4d",
    products: [
      { name: "Cotton Bedsheet Set", price: 9500, category: "Home" },
      { name: "Non-Stick Pot Set", price: 18500, category: "Home" },
      { name: "Ladies Handbag", price: 11000, category: "Fashion" },
      { name: "Vitamin C Serum", price: 6500, category: "Beauty" },
      { name: "Bluetooth Speaker", price: 13500, category: "Electronics" },
      { name: "Rice 5kg Bag", price: 7800, category: "Grocery" },
      { name: "Kids Sneakers", price: 8200, category: "Kids" },
      { name: "Men's Polo Pack", price: 9800, category: "Fashion" },
    ],
  },
];

// Free stock photography from the Unsplash CDN (hotlinkable under the Unsplash
// License). Multiple photos per category give visual variety across the grid.
export const CATEGORY_IMAGES: Record<Category, string[]> = {
  Fashion: [
    "1441984904996-e0b6ba687e04",
    "1445205170230-053b83016050",
    "1483985988355-763728e1935b",
    "1594633312681-425c7b97ccd1",
    "1539109136881-3be0616acf4b",
  ],
  Electronics: [
    "1505740420928-5e560c06d30e",
    "1526170375885-4d8ecf77b99f",
    "1608043152269-423dbba4e7e1",
    "1517336714731-489689fd1ca8",
  ],
  Home: [
    "1513694203232-719a280e022f",
    "1556228453-efd6c1ff04f6",
    "1522708323590-d24dbb6b0267",
  ],
  Beauty: [
    "1596462502278-27bfdc403348",
    "1522335789203-aabd1fc54bc9",
    "1512496015851-a90fb38ba796",
  ],
  Grocery: [
    "1542838132-92c53300491e",
    "1506617564039-2f3b650b7010",
    "1543168256-418811576931",
  ],
  Kids: [
    "1503919545889-aef636e10ad4",
    "1596461404969-9ae70f2830c1",
    "1515488042361-ee00e0ddd4e4",
    "1560859251-d563a49c5e4a",
  ],
};

export const COLLECTION_HERO_IMAGES: Record<string, string> = {
  "detty-december": "1470229722913-7c0e2dbbafd3",
  christmas: "1512389142860-9c449e58a543",
  valentine: "1518895949257-7621c3c786d7",
  "back-to-school": "1503676260728-1c00da094a0b",
  ramadan: "1519671482749-fd09be7ccebf",
  "black-friday": "1607083206869-4c7672e72a8a",
  everyday: "1441986300917-64674bd600d8",
};

/** Build a sized Unsplash CDN URL from a photo id. */
export function unsplashUrl(id: string, width: number, height?: number): string {
  const h = height ? `&h=${height}` : "";
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}${h}&q=80`;
}

export const SOURCES: ProductSource[] = ["jumia", "konga", "local"];

/**
 * Deterministic per-position product metadata (id/rating/image/source), shared
 * by the static frontend and the DB seed so both render identically. No
 * Math.random — values are stable functions of the index.
 */
export function deriveProductMeta(raw: SeedRawProduct, slug: string, index: number) {
  const source = SOURCES[index % SOURCES.length];
  const rating = 4 + ((index * 7) % 10) / 10; // 4.0–4.9
  const pool = CATEGORY_IMAGES[raw.category];
  const imageId = pool[index % pool.length];
  return {
    id: `${slug}-${index}`,
    source,
    rating,
    image: unsplashUrl(imageId, 800),
  };
}

/** URL-safe slug from a product name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
