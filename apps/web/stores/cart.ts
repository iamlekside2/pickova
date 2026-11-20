"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QTY_PER_LINE } from "@pickova/shared";

/**
 * The cart, persisted in localStorage so it survives between visits.
 *
 * Each line keeps a display snapshot so the cart renders instantly, but the
 * snapshot is never trusted for money: the cart page re-prices everything via
 * POST /cart/quote, and checkout builds the order from the database.
 */
export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  colourName: string;
  imageUrl: string | null;
  unitPriceKobo: number;
  quantity: number;
  /** stock ceiling known when the line was added / last quoted */
  available: number;
};

type CartState = {
  lines: CartLine[];
  couponCode: string | null;
  /** true once the persisted cart has been read from localStorage */
  hydrated: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  /** Applies server-quoted truth (price, stock, clamped quantity) to stored lines. */
  sync: (fresh: CartLine[]) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
};

const cap = (qty: number, available: number) => Math.max(1, Math.min(qty, available, MAX_QTY_PER_LINE));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      hydrated: false,
      add: (line, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.variantId === line.variantId ? { ...l, ...line, quantity: cap(l.quantity + quantity, line.available) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity: cap(quantity, line.available) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: cap(quantity, l.available) } : l)),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      sync: (fresh) => set({ lines: fresh }),
      setCoupon: (couponCode) => set({ couponCode }),
      clear: () => set({ lines: [], couponCode: null }),
    }),
    {
      name: "pickova-cart",
      version: 1,
      partialize: (s) => ({ lines: s.lines, couponCode: s.couponCode }),
      // Read localStorage only after React has hydrated (see StoreHydrator), so
      // the first client render always matches the server-rendered HTML.
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.unitPriceKobo * l.quantity, 0);
