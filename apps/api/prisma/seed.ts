/**
 * Seeds reference data every store needs (categories, sizes, colours, delivery
 * zones, settings) and — unless SEED_SAMPLE_CATALOGUE=false — a SAMPLE
 * catalogue for development and design review.
 *
 * The sample listings use real sneaker photographs from Unsplash (free licence,
 * files in apps/web/public/products — see SOURCES.md there). The photos show
 * real shoes, but the listings, prices and stock levels are placeholders, not
 * Pickova inventory: the storefront shows a notice while the `sampleCatalogue`
 * setting is true. Replace them with your own products and photos before launch.
 *
 * Safe to run repeatedly: existing rows are left as they are.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NIGERIAN_STATES } from "@pickova/shared";

const prisma = new PrismaClient();
const naira = (n: number) => n * 100;

const CATEGORIES = [
  { name: "Men", slug: "men", description: "Everyday sneakers and casual shoes for men.", sortOrder: 1 },
  { name: "Women", slug: "women", description: "Comfortable, stylish pairs for women.", sortOrder: 2 },
  { name: "Kids", slug: "kids", description: "Tough, comfy shoes for school and play.", sortOrder: 3 },
  { name: "Sports", slug: "sports", description: "Sneakers built for training, running and the pitch.", sortOrder: 4 },
  { name: "Casual", slug: "casual", description: "Easy pairs for work, outings and weekends.", sortOrder: 5 },
];

const KIDS_SIZES = ["28", "29", "30", "31", "32", "33", "34", "35"];
const ADULT_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

const COLOURS: Record<string, string> = {
  White: "#FFFFFF",
  Black: "#16181D",
  Navy: "#1B2A4A",
  Grey: "#8D95A3",
  Red: "#C8322B",
  Orange: "#F28C28",
  Pink: "#E8A0B4",
  Blue: "#2B5FB8",
  Teal: "#3FB6B2",
  Khaki: "#B8AD8A",
  Volt: "#C5F135",
};

// Delivery fees are starting values for the owner to review in Delivery Management.
const SOUTH_WEST = new Set(["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"]);
function zoneFor(state: string) {
  if (state === "Lagos") return { feeKobo: naira(2500), etaMinDays: 1, etaMaxDays: 2 };
  if (SOUTH_WEST.has(state)) return { feeKobo: naira(3500), etaMinDays: 2, etaMaxDays: 4 };
  if (state === "FCT (Abuja)") return { feeKobo: naira(4000), etaMinDays: 2, etaMaxDays: 4 };
  return { feeKobo: naira(5000), etaMinDays: 3, etaMaxDays: 6 };
}

/** One colour of a product and its photos (files in apps/web/public/products). */
type Colourway = { colour: string; photos: string[] };
type Sample = {
  name: string;
  brand: string;
  sku: string;
  description: string;
  price: number;
  was?: number;
  categories: string[];
  sizes: string[];
  colourways: Colourway[];
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
};

const MEN = ["40", "41", "42", "43", "44", "45", "46"];
const WOMEN = ["36", "37", "38", "39", "40", "41"];
const UNISEX = ["38", "39", "40", "41", "42", "43", "44", "45"];

const SAMPLES: Sample[] = [
  {
    name: "Nike Dunk Low Black/White", brand: "Nike", sku: "NK-DUNK-PANDA", price: 95000, was: 110000,
    description: "The black-and-white Dunk Low. Leather upper, padded collar and a classic cupsole — the pair that goes with everything.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [{ colour: "Black", photos: ["nike-dunk-low-panda-1.jpg", "nike-dunk-low-panda-2.jpg"] }],
    featured: true, isNew: true, bestSeller: true,
  },
  {
    name: "Nike Air Force 1 '07 White", brand: "Nike", sku: "NK-AF1-WHT", price: 85000, was: 105000,
    description: "The all-white Air Force 1. Crisp leather, a chunky midsole with Air cushioning, and a look that never goes out of style.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [{ colour: "White", photos: ["nike-air-force-1-white-1.jpg", "nike-air-force-1-white-2.jpg"] }],
    featured: true, bestSeller: true,
  },
  {
    name: "Air Jordan 1 High Red/White", brand: "Jordan", sku: "JD-AJ1-RED", price: 145000,
    description: "A high-top icon in red, white and black. Ankle support, leather panels and unmistakable court heritage.",
    categories: ["men", "casual"], sizes: MEN,
    colourways: [{ colour: "Red", photos: ["air-jordan-1-high-red-1.jpg"] }],
    featured: true, isNew: true,
  },
  {
    name: "Adidas Superstar White/Black", brand: "Adidas", sku: "AD-SUPERSTAR", price: 78000, was: 90000,
    description: "The shell-toe original. Smooth leather upper with the three stripes and a rubber cupsole.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [{ colour: "White", photos: ["adidas-superstar-1.jpg"] }],
    bestSeller: true,
  },
  {
    name: "Adidas Samba OG", brand: "Adidas", sku: "AD-SAMBA", price: 88000,
    description: "Born on the indoor pitch, now an everyday favourite. Low-profile leather upper, suede toe and a gum sole.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [
      { colour: "White", photos: ["adidas-samba-white-1.jpg"] },
      { colour: "Grey", photos: ["adidas-samba-grey-1.jpg"] },
    ],
    isNew: true, bestSeller: true,
  },
  {
    name: "Nike Air Max 1 Ultra White/Orange", brand: "Nike", sku: "NK-AM1-ORG", price: 98000, was: 120000,
    description: "Lightweight mesh with visible Air cushioning in the heel. A bright, easy runner-style sneaker for long days.",
    categories: ["women", "sports"], sizes: WOMEN,
    colourways: [{ colour: "Orange", photos: ["nike-air-max-1-ultra-1.jpg", "nike-air-max-1-ultra-2.jpg", "nike-air-max-1-ultra-3.jpg"] }],
    featured: true, isNew: true,
  },
  {
    name: "Nike Air Max 90 Pink/Blue", brand: "Nike", sku: "NK-AM90-PNK", price: 105000,
    description: "The Air Max 90 in a playful pink, grey and blue. Cushioned, breathable and built to stand out.",
    categories: ["women", "sports"], sizes: WOMEN,
    colourways: [{ colour: "Pink", photos: ["nike-air-max-90-pink-1.jpg"] }],
    bestSeller: true,
  },
  {
    name: "New Balance X-90 Pink", brand: "New Balance", sku: "NB-X90-PNK", price: 72000, was: 85000,
    description: "Retro running lines with modern cushioning, in soft pink and grey. Comfortable from the first wear.",
    categories: ["women", "casual"], sizes: WOMEN,
    colourways: [{ colour: "Pink", photos: ["new-balance-x90-pink-1.jpg"] }],
    isNew: true,
  },
  {
    name: "New Balance CRT300 White/Blue", brand: "New Balance", sku: "NB-CRT300", price: 68000,
    description: "A clean court shoe in white mesh and suede with a blue heel tab. Light, breathable and easy to wear.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [{ colour: "White", photos: ["new-balance-crt300-1.jpg"] }],
  },
  {
    name: "Converse Chuck Taylor All Star High", brand: "Converse", sku: "CV-CHUCK-HI", price: 45000,
    description: "The original canvas high-top. Rubber toe cap, ankle patch and a look that has worked for a hundred years.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colourways: [
      { colour: "Khaki", photos: ["converse-chuck-taylor-khaki-1.jpg"] },
      { colour: "Teal", photos: ["converse-chuck-taylor-teal-1.jpg"] },
    ],
    bestSeller: true,
  },
  {
    name: "Puma Smash Leather White", brand: "Puma", sku: "PM-SMASH-WHT", price: 52000, was: 60000,
    description: "A minimal tennis-style sneaker in perforated white leather. Clean enough for the office, relaxed enough for the weekend.",
    categories: ["men", "casual"], sizes: MEN,
    colourways: [{ colour: "White", photos: ["puma-smash-white-1.jpg", "puma-smash-white-2.jpg"] }],
    isNew: true,
  },
  {
    name: "Puma Smash Suede Navy", brand: "Puma", sku: "PM-SMASH-NVY", price: 55000,
    description: "Soft navy suede with the white formstrip and a grippy rubber sole. An everyday classic.",
    categories: ["men", "casual"], sizes: MEN,
    colourways: [{ colour: "Navy", photos: ["puma-smash-navy-1.jpg"] }],
    featured: true,
  },
  {
    name: "Nike Free RN Flyknit Red", brand: "Nike", sku: "NK-FREERN-RED", price: 92000,
    description: "A sock-like Flyknit upper on a flexible sole that moves with your foot. Made for easy runs and gym days.",
    categories: ["men", "sports"], sizes: MEN,
    colourways: [{ colour: "Red", photos: ["nike-free-rn-red-1.jpg"] }],
    featured: true, bestSeller: true,
  },
  {
    name: "Nike SuperRep Go Volt", brand: "Nike", sku: "NK-SUPERREP", price: 89000, was: 99000,
    description: "A stable, cushioned training shoe for circuits, classes and everything in between — in can't-miss volt green.",
    categories: ["men", "women", "sports"], sizes: UNISEX,
    colourways: [{ colour: "Volt", photos: ["nike-superrep-volt-1.jpg"] }],
    isNew: true,
  },
  {
    name: "Adidas Ultraboost 20 Solar Red", brand: "Adidas", sku: "AD-UB20-RED", price: 125000, was: 140000,
    description: "Responsive Boost cushioning under a snug knit upper. A premium running shoe for chasing personal bests.",
    categories: ["men", "sports"], sizes: MEN,
    colourways: [{ colour: "Red", photos: ["adidas-ultraboost-red-1.jpg"] }],
    featured: true,
  },
  {
    name: "Adidas Alphabounce Blue", brand: "Adidas", sku: "AD-ALPHAB-BLU", price: 76000,
    description: "A flexible mesh upper on a bouncy midsole. A versatile runner for the road, the gym and the school run.",
    categories: ["men", "sports"], sizes: MEN,
    colourways: [{ colour: "Blue", photos: ["adidas-alphabounce-blue-1.jpg"] }],
  },
  {
    name: "Nike Dunk Low Orange/Mint", brand: "Nike", sku: "NK-DUNK-ORG", price: 99000,
    description: "The Dunk Low in soft suede — orange and mint with a cream sole. A colourful take on a classic.",
    categories: ["women", "casual"], sizes: WOMEN,
    colourways: [{ colour: "Orange", photos: ["nike-dunk-low-orange-1.jpg"] }],
    isNew: true,
  },
  {
    name: "Vans Old Skool Kids Black", brand: "Vans", sku: "VN-OLDSKOOL-K", price: 32000,
    description: "The Old Skool, sized down. Easy hook-and-loop straps, tough canvas and suede, and the classic side stripe.",
    categories: ["kids", "casual"], sizes: KIDS_SIZES,
    colourways: [{ colour: "Black", photos: ["vans-old-skool-kids-1.jpg"] }],
    isNew: true, bestSeller: true,
  },
  {
    name: "Nike Kids Court Sneaker White/Red", brand: "Nike", sku: "NK-KIDS-COURT", price: 28000, was: 34000,
    description: "A little leather court shoe with red trim. Light, flexible and easy to clean after a day of play.",
    categories: ["kids", "sports"], sizes: KIDS_SIZES,
    colourways: [{ colour: "White", photos: ["nike-kids-court-1.jpg"] }],
    featured: true,
  },
];

const slugify = (s: string) => s.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Deterministic pseudo-random stock so every seed produces the same store. */
function sampleStock(sku: string): number {
  let h = 0;
  for (const ch of sku) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const roll = h % 10;
  return roll < 2 ? 0 : roll < 4 ? 2 : 4 + (h % 9); // ~20% sold out, ~20% low
}

async function seedReferenceData() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  for (const [i, label] of [...KIDS_SIZES, ...ADULT_SIZES].entries()) {
    await prisma.size.upsert({
      where: { system_label: { system: "EU", label } },
      update: {},
      create: { system: "EU", label, sortOrder: i },
    });
  }
  for (const [name, value] of Object.entries(COLOURS)) {
    await prisma.colour.upsert({ where: { name }, update: {}, create: { name, hex: value } });
  }
  for (const state of NIGERIAN_STATES) {
    await prisma.deliveryZone.upsert({ where: { state }, update: {}, create: { state, ...zoneFor(state) } });
  }

  const settings: Record<string, unknown> = {
    // Fill these in from Store Settings; empty values are simply not displayed.
    contact: { email: "", phone: "", whatsapp: "", address: "" },
    social: { instagram: "", tiktok: "", facebook: "", x: "" },
    freeDeliveryThresholdKobo: 0, // 0 = no free-delivery offer
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.storeSetting.upsert({ where: { key }, update: {}, create: { key, value: value as object } });
  }

  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        { placement: "ANNOUNCEMENT", title: "Fast delivery across Nigeria", sortOrder: 1 },
        { placement: "ANNOUNCEMENT", title: "Real photos. Honest prices. Secure payments.", sortOrder: 2 },
        {
          placement: "PROMO",
          title: "Fresh pairs, honest prices",
          subtitle: "New styles land every week. See what just arrived before your size is gone.",
          ctaLabel: "Shop New Arrivals",
          ctaHref: "/new-arrivals",
          sortOrder: 1,
        },
      ],
    });
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return console.info("· ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin account created");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return console.info(`· Admin ${email} already exists — left unchanged`);
  await prisma.user.create({
    data: { email, firstName: "Pickova", lastName: "Admin", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12), emailVerifiedAt: new Date() },
  });
  console.info(`· Created admin ${email}`);
}

async function seedSampleCatalogue() {
  const [categories, sizes, colours] = await Promise.all([
    prisma.category.findMany(),
    prisma.size.findMany({ where: { system: "EU" } }),
    prisma.colour.findMany(),
  ]);
  const categoryId = new Map(categories.map((c) => [c.slug, c.id]));
  const sizeId = new Map(sizes.map((s) => [s.label, s.id]));
  const colourId = new Map(colours.map((c) => [c.name, c.id]));

  let created = 0;
  for (const [index, s] of SAMPLES.entries()) {
    const slug = slugify(s.name);
    if (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) continue;

    await prisma.product.create({
      data: {
        name: s.name,
        slug,
        sku: s.sku,
        description: s.description,
        brand: s.brand,
        priceKobo: naira(s.price),
        compareAtPriceKobo: s.was ? naira(s.was) : null,
        status: "ACTIVE",
        isFeatured: s.featured ?? false,
        isNewArrival: s.isNew ?? false,
        isBestSeller: s.bestSeller ?? false,
        // Stagger creation times so "newest" ordering is stable.
        createdAt: new Date(Date.now() - index * 3_600_000),
        categories: { create: s.categories.map((c) => ({ categoryId: categoryId.get(c)! })) },
        images: {
          create: s.colourways.flatMap((w, wi) =>
            w.photos.map((file, pi) => ({
              url: `/products/${file}`,
              alt: `${s.name}${s.colourways.length > 1 ? ` in ${w.colour}` : ""}${pi > 0 ? ` — view ${pi + 1}` : ""}`,
              colourId: colourId.get(w.colour)!,
              sortOrder: wi * 10 + pi,
            })),
          ),
        },
        variants: {
          create: s.colourways.flatMap((w) =>
            s.sizes.map((label) => {
              const sku = `${s.sku}-${w.colour.slice(0, 3).toUpperCase()}-${label}`;
              return {
                sku,
                sizeId: sizeId.get(label)!,
                colourId: colourId.get(w.colour)!,
                inventory: { create: { quantity: sampleStock(sku) } },
              };
            }),
          ),
        },
      },
    });
    created++;
  }

  await prisma.storeSetting.upsert({ where: { key: "sampleCatalogue" }, update: {}, create: { key: "sampleCatalogue", value: true } });
  // A sample code so the coupon flow can be exercised in development.
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", description: "10% off your order", type: "PERCENT", value: 10, maxDiscountKobo: naira(10000) },
  });
  console.info(`· Sample catalogue: ${created} product(s) created`);
}

async function main() {
  await seedReferenceData();
  await seedAdmin();
  if (process.env.SEED_SAMPLE_CATALOGUE !== "false") await seedSampleCatalogue();
  console.info("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
