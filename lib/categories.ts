import type { LucideIcon } from "lucide-react";
import type { Category } from "./types";
import { CATEGORY_DATA } from "./catalog-data";
import { resolveIcon } from "./icons";

export type CategoryMeta = {
  name: Category;
  icon: LucideIcon;
  blurb: string;
};

/** Neutral, buyer-facing category directory used across the homepage. */
export const CATEGORY_META: CategoryMeta[] = CATEGORY_DATA.map((c) => ({
  name: c.name,
  icon: resolveIcon(c.icon),
  blurb: c.blurb,
}));
