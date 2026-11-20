"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QTY_PER_LINE } from "@/lib/shared";

/**
 * The cart, kept in this browser's localStorage so it survives between visits.
 *
 * Only the choice is stored — which size/colour (by order code) and how many.
 * Names, prices and availability are looked up from the live catalogue every
 * time the cart is shown (lib/catalog → quoteCart), so a stale or edited
 * browser copy can never show an old price.
 */
export type CartLine = { variantId: string; quantity: number };

type CartState = {
  lines: CartLine[];
  /** true once the saved cart has been read from localStorage */
  hydrated: boolean;
  add: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const cap = (qty: number) => Math.max(1, Math.min(Math.trunc(qty) || 1, MAX_QTY_PER_LINE));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      add: (variantId, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === variantId);
          if (existing) return { lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: cap(l.quantity + quantity) } : l)) };
          return { lines: [...s.lines, { variantId, quantity: cap(quantity) }] };
        }),
      setQuantity: (variantId, quantity) => set((s) => ({ lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: cap(quantity) } : l)) })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "pickova-cart",
      // v2: lines hold only { variantId, quantity }. Older carts used database ids and are discarded.
      version: 2,
      migrate: () => ({ lines: [] }),
      partialize: (s) => ({ lines: s.lines }),
      // Read localStorage only after React has hydrated (see StoreHydrator), so
      // the first client render always matches the server-rendered HTML.
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
