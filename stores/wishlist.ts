"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Wishlist: just the saved product slugs, kept on this device. Details come from the catalogue. */
type WishlistState = {
  slugs: string[];
  hydrated: boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      hydrated: false,
      toggle: (slug) => set((s) => ({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [slug, ...s.slugs] })),
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
    }),
    {
      name: "pickova-wishlist",
      version: 2,
      migrate: () => ({ slugs: [] }),
      partialize: (s) => ({ slugs: s.slugs }),
      skipHydration: true, // see StoreHydrator
    },
  ),
);
