"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

/** Empties the cart on mount — rendered on the order-confirmation screen. */
export function CartClear() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
