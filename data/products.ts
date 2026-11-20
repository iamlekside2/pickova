/**
 * THE CATALOGUE. Every product on the site comes from this file.
 *
 * To add a product: copy one block, change the details, and put its photos in
 * public/products/. To mark a size as sold out, add it to `soldOut` for that
 * colour. To take a product off the site, delete its block (or set
 * `hidden: true`). Then redeploy.
 *
 * Prices are in whole naira. The current listings are SAMPLES built around
 * free stock photos (see public/products/SOURCES.md) — replace them with your
 * real stock, prices and photos, then set `sampleCatalogue: false` in store.ts.
 */

export type CategorySlug = "men" | "women" | "kids" | "sports" | "casual";

export type ProductSource = {
  name: string;
  brand: string;
  /** Short code used on orders so you can tell exactly which item was picked. */
  sku: string;
  description: string;
  price: number;
  /** Previous price, shown struck through. Must be higher than `price`. */
  was?: number;
  categories: CategorySlug[];
  /** EU sizes this style comes in. */
  sizes: string[];
  colours: {
    name: string;
    /** photo file names inside public/products/ */
    photos: string[];
    /** sizes currently unavailable in this colour */
    soldOut?: string[];
  }[];
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  hidden?: boolean;
};

export const CATEGORIES: { slug: CategorySlug; name: string; description: string }[] = [
  { slug: "men", name: "Men", description: "Everyday sneakers and casual shoes for men." },
  { slug: "women", name: "Women", description: "Comfortable, stylish pairs for women." },
  { slug: "kids", name: "Kids", description: "Tough, comfy shoes for school and play." },
  { slug: "sports", name: "Sports", description: "Sneakers built for training, running and the pitch." },
  { slug: "casual", name: "Casual", description: "Easy pairs for work, outings and weekends." },
];

/** Swatch colours for the colour names used below. */
export const COLOUR_HEX: Record<string, string> = {
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

const KIDS = ["28", "29", "30", "31", "32", "33", "34", "35"];
const MEN = ["40", "41", "42", "43", "44", "45", "46"];
const WOMEN = ["36", "37", "38", "39", "40", "41"];
const UNISEX = ["38", "39", "40", "41", "42", "43", "44", "45"];

/** Listed newest first — this order is the "Newest" sort on the site. */
export const PRODUCTS: ProductSource[] = [
  {
    name: "Nike Dunk Low Black/White", brand: "Nike", sku: "NK-DUNK-PANDA", price: 95000, was: 110000,
    description: "The black-and-white Dunk Low. Leather upper, padded collar and a classic cupsole — the pair that goes with everything.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [{ name: "Black", photos: ["nike-dunk-low-panda-1.jpg", "nike-dunk-low-panda-2.jpg"]}],
    featured: true, isNew: true, bestSeller: true,
  },
  {
    name: "Nike Air Force 1 '07 White", brand: "Nike", sku: "NK-AF1-WHT", price: 85000, was: 105000,
    description: "The all-white Air Force 1. Crisp leather, a chunky midsole with Air cushioning, and a look that never goes out of style.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [{ name: "White", photos: ["nike-air-force-1-white-1.jpg", "nike-air-force-1-white-2.jpg"] }],
    featured: true, bestSeller: true,
  },
  {
    name: "Air Jordan 1 High Red/White", brand: "Jordan", sku: "JD-AJ1-RED", price: 145000,
    description: "A high-top icon in red, white and black. Ankle support, leather panels and unmistakable court heritage.",
    categories: ["men", "casual"], sizes: MEN,
    colours: [{ name: "Red", photos: ["air-jordan-1-high-red-1.jpg"]}],
    featured: true, isNew: true,
  },
  {
    name: "Adidas Superstar White/Black", brand: "Adidas", sku: "AD-SUPERSTAR", price: 78000, was: 90000,
    description: "The shell-toe original. Smooth leather upper with the three stripes and a rubber cupsole.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [{ name: "White", photos: ["adidas-superstar-1.jpg"] }],
    bestSeller: true,
  },
  {
    name: "Adidas Samba OG", brand: "Adidas", sku: "AD-SAMBA", price: 88000,
    description: "Born on the indoor pitch, now an everyday favourite. Low-profile leather upper, suede toe and a gum sole.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [
      { name: "White", photos: ["adidas-samba-white-1.jpg"]},
      { name: "Grey", photos: ["adidas-samba-grey-1.jpg"] },
    ],
    isNew: true, bestSeller: true,
  },
  {
    name: "Nike Air Max 1 Ultra White/Orange", brand: "Nike", sku: "NK-AM1-ORG", price: 98000, was: 120000,
    description: "Lightweight mesh with visible Air cushioning in the heel. A bright, easy runner-style sneaker for long days.",
    categories: ["women", "sports"], sizes: WOMEN,
    colours: [{ name: "Orange", photos: ["nike-air-max-1-ultra-1.jpg", "nike-air-max-1-ultra-2.jpg", "nike-air-max-1-ultra-3.jpg"] }],
    featured: true, isNew: true,
  },
  {
    name: "Nike Air Max 90 Pink/Blue", brand: "Nike", sku: "NK-AM90-PNK", price: 105000,
    description: "The Air Max 90 in a playful pink, grey and blue. Cushioned, breathable and built to stand out.",
    categories: ["women", "sports"], sizes: WOMEN,
    colours: [{ name: "Pink", photos: ["nike-air-max-90-pink-1.jpg"] }],
    bestSeller: true,
  },
  {
    name: "New Balance X-90 Pink", brand: "New Balance", sku: "NB-X90-PNK", price: 72000, was: 85000,
    description: "Retro running lines with modern cushioning, in soft pink and grey. Comfortable from the first wear.",
    categories: ["women", "casual"], sizes: WOMEN,
    colours: [{ name: "Pink", photos: ["new-balance-x90-pink-1.jpg"] }],
    isNew: true,
  },
  {
    name: "New Balance CRT300 White/Blue", brand: "New Balance", sku: "NB-CRT300", price: 68000,
    description: "A clean court shoe in white mesh and suede with a blue heel tab. Light, breathable and easy to wear.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [{ name: "White", photos: ["new-balance-crt300-1.jpg"] }],
  },
  {
    name: "Converse Chuck Taylor All Star High", brand: "Converse", sku: "CV-CHUCK-HI", price: 45000,
    description: "The original canvas high-top. Rubber toe cap, ankle patch and a look that has worked for a hundred years.",
    categories: ["men", "women", "casual"], sizes: UNISEX,
    colours: [
      { name: "Khaki", photos: ["converse-chuck-taylor-khaki-1.jpg"] },
      { name: "Teal", photos: ["converse-chuck-taylor-teal-1.jpg"] },
    ],
    bestSeller: true,
  },
  {
    name: "Puma Smash Leather White", brand: "Puma", sku: "PM-SMASH-WHT", price: 52000, was: 60000,
    description: "A minimal tennis-style sneaker in perforated white leather. Clean enough for the office, relaxed enough for the weekend.",
    categories: ["men", "casual"], sizes: MEN,
    colours: [{ name: "White", photos: ["puma-smash-white-1.jpg", "puma-smash-white-2.jpg"] }],
    isNew: true,
  },
  {
    name: "Puma Smash Suede Navy", brand: "Puma", sku: "PM-SMASH-NVY", price: 55000,
    description: "Soft navy suede with the white formstrip and a grippy rubber sole. An everyday classic.",
    categories: ["men", "casual"], sizes: MEN,
    colours: [{ name: "Navy", photos: ["puma-smash-navy-1.jpg"] }],
    featured: true,
  },
  {
    name: "Nike Free RN Flyknit Red", brand: "Nike", sku: "NK-FREERN-RED", price: 92000,
    description: "A sock-like Flyknit upper on a flexible sole that moves with your foot. Made for easy runs and gym days.",
    categories: ["men", "sports"], sizes: MEN,
    colours: [{ name: "Red", photos: ["nike-free-rn-red-1.jpg"] }],
    featured: true, bestSeller: true,
  },
  {
    name: "Nike SuperRep Go Volt", brand: "Nike", sku: "NK-SUPERREP", price: 89000, was: 99000,
    description: "A stable, cushioned training shoe for circuits, classes and everything in between — in can't-miss volt green.",
    categories: ["men", "women", "sports"], sizes: UNISEX,
    colours: [{ name: "Volt", photos: ["nike-superrep-volt-1.jpg"] }],
    isNew: true,
  },
  {
    name: "Adidas Ultraboost 20 Solar Red", brand: "Adidas", sku: "AD-UB20-RED", price: 125000, was: 140000,
    description: "Responsive Boost cushioning under a snug knit upper. A premium running shoe for chasing personal bests.",
    categories: ["men", "sports"], sizes: MEN,
    colours: [{ name: "Red", photos: ["adidas-ultraboost-red-1.jpg"] }],
    featured: true,
  },
  {
    name: "Adidas Alphabounce Blue", brand: "Adidas", sku: "AD-ALPHAB-BLU", price: 76000,
    description: "A flexible mesh upper on a bouncy midsole. A versatile runner for the road, the gym and the school run.",
    categories: ["men", "sports"], sizes: MEN,
    colours: [{ name: "Blue", photos: ["adidas-alphabounce-blue-1.jpg"] }],
  },
  {
    name: "Nike Dunk Low Orange/Mint", brand: "Nike", sku: "NK-DUNK-ORG", price: 99000,
    description: "The Dunk Low in soft suede — orange and mint with a cream sole. A colourful take on a classic.",
    categories: ["women", "casual"], sizes: WOMEN,
    colours: [{ name: "Orange", photos: ["nike-dunk-low-orange-1.jpg"] }],
    isNew: true,
  },
  {
    name: "Vans Old Skool Kids Black", brand: "Vans", sku: "VN-OLDSKOOL-K", price: 32000,
    description: "The Old Skool, sized down. Easy hook-and-loop straps, tough canvas and suede, and the classic side stripe.",
    categories: ["kids", "casual"], sizes: KIDS,
    colours: [{ name: "Black", photos: ["vans-old-skool-kids-1.jpg"] }],
    isNew: true, bestSeller: true,
  },
  {
    name: "Nike Kids Court Sneaker White/Red", brand: "Nike", sku: "NK-KIDS-COURT", price: 28000, was: 34000,
    description: "A little leather court shoe with red trim. Light, flexible and easy to clean after a day of play.",
    categories: ["kids", "sports"], sizes: KIDS,
    colours: [{ name: "White", photos: ["nike-kids-court-1.jpg"] }],
    featured: true,
  },
];
