"use client";

import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

export function AddToBasketButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover sm:flex-none"
    >
      <ShoppingCart size={18} />
      Add to Basket
    </button>
  );
}
