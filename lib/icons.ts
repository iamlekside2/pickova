import {
  Gift,
  Heart,
  GraduationCap,
  Star,
  Moon,
  Zap,
  Flame,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  ShoppingBasket,
  Baby,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Maps the icon-name strings stored in data/DB to Lucide components. */
export const ICON_MAP: Record<string, LucideIcon> = {
  Gift,
  Heart,
  GraduationCap,
  Star,
  Moon,
  Zap,
  Flame,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  ShoppingBasket,
  Baby,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Flame;
}

/** Icon names selectable in the admin (e.g. category icon picker). */
export const ICON_NAMES = Object.keys(ICON_MAP);
