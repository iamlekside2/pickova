"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummaryDTO } from "@pickova/shared";

/**
 * Wishlist, kept on the device so guests can use it. Phase 3 syncs it to the
 * signed-in customer's account (WishlistItem table).
 */
export type WishlistEntry = Pick<ProductSummaryDTO, "id" | "slug" | "name" | "priceKobo" | "compareAtPriceKobo" | "image">;

type WishlistState = {
  items: WishlistEntry[];
  hydrated: boolean;
  toggle: (product: WishlistEntry) => void;
  remove: (id: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      toggle: (product) =>
        set((s) => ({
          items: s.items.some((i) => i.id === product.id) ? s.items.filter((i) => i.id !== product.id) : [product, ...s.items],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    {
      name: "pickova-wishlist",
      version: 1,
      partialize: (s) => ({ items: s.items }),
      skipHydration: true, // see StoreHydrator
    },
  ),
);
