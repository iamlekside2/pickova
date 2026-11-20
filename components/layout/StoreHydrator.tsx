"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";

/**
 * Loads the cart and wishlist saved on this device once the page has
 * hydrated, and keeps open tabs in step with each other.
 */
export function StoreHydrator() {
  useEffect(() => {
    const load = async () => {
      await Promise.all([useCart.persist.rehydrate(), useWishlist.persist.rehydrate()]);
      useCart.setState({ hydrated: true });
      useWishlist.setState({ hydrated: true });
    };
    void load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === useCart.persist.getOptions().name) void useCart.persist.rehydrate();
      if (e.key === useWishlist.persist.getOptions().name) void useWishlist.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
