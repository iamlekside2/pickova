import type { LucideIcon } from "lucide-react";

export type Category =
  | "Fashion"
  | "Electronics"
  | "Home"
  | "Beauty"
  | "Grocery"
  | "Kids";

export const CATEGORIES: Category[] = [
  "Fashion",
  "Electronics",
  "Home",
  "Beauty",
  "Grocery",
  "Kids",
];

export type ProductSource = "jumia" | "konga" | "local";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  affiliateUrl: string;
  season: string; // season slug
  category: Category;
  rating: number;
  source: ProductSource;
};

export type Season = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  icon: LucideIcon;
  /** Whether this season is the currently in-season one (computed from the month). */
  active: boolean;
  startMonth: number;
  endMonth: number;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  /** Left-to-right gradient theme used for hero + placeholders. */
  themeFrom: string;
  themeTo: string;
  categories: Category[];
  products: Product[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  season: string;
  qty: number;
};
