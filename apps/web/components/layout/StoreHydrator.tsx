"use client";

import { useEffect, useRef } from "react";
import type { ProductSummaryDTO, SavedCartDTO } from "@pickova/shared";
import { api } from "@/lib/api";
import { useCart, type CartLine } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { useWishlist } from "@/stores/wishlist";

/** Server-priced lines → what the cart store keeps. Sold-out lines stay visible at quantity 1. */
export function toCartLines(lines: SavedCartDTO["lines"]): CartLine[] {
  return lines.map((l) => ({
    variantId: l.variantId,
    productId: l.productId,
    slug: l.slug,
    name: l.name,
    sizeLabel: l.sizeLabel,
    colourName: l.colourName,
    imageUrl: l.imageUrl,
    unitPriceKobo: l.unitPriceKobo,
    quantity: Math.max(1, l.quantity),
    available: l.available,
  }));
}

const cartPayload = () => {
  const { lines, couponCode } = useCart.getState();
  return { items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), couponCode };
};

/**
 * Boots client state after the page hydrates:
 *  1. loads the cart and wishlist saved on this device, and who is signed in;
 *  2. on sign-in, merges the device's cart and wishlist into the account once;
 *  3. from then on, mirrors every change to the account so it follows the
 *     customer across devices.
 */
export function StoreHydrator() {
  const user = useSession((s) => s.user);
  const cartReady = useCart((s) => s.hydrated);
  const wishReady = useWishlist((s) => s.hydrated);
  /** id of the user whose account is currently mirrored, if any */
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    const load = async () => {
      await Promise.all([useCart.persist.rehydrate(), useWishlist.persist.rehydrate()]);
      useCart.setState({ hydrated: true });
      useWishlist.setState({ hydrated: true });
    };
    void load();
    void useSession.getState().load();

    // Keep tabs in step with each other.
    const onStorage = (e: StorageEvent) => {
      if (e.key === useCart.persist.getOptions().name) void useCart.persist.rehydrate();
      if (e.key === useWishlist.persist.getOptions().name) void useWishlist.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (!cartReady || !wishReady || syncedFor.current === user.id) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribers: (() => void)[] = [];

    const start = async () => {
      // One-time merge of what this device had into the account.
      const [wishlist, cart] = await Promise.all([
        api<ProductSummaryDTO[]>("/account/wishlist/merge", { method: "POST", body: { productIds: useWishlist.getState().items.map((i) => i.id) } }),
        api<SavedCartDTO>("/account/cart", { method: "PUT", body: { ...cartPayload(), couponCode: useCart.getState().couponCode ?? undefined, merge: true } }),
      ]);
      if (cancelled) return;
      useWishlist.setState({
        items: wishlist.map((p) => ({ id: p.id, slug: p.slug, name: p.name, priceKobo: p.priceKobo, compareAtPriceKobo: p.compareAtPriceKobo, image: p.image })),
      });
      useCart.setState({ lines: toCartLines(cart.lines), couponCode: cart.couponCode ?? useCart.getState().couponCode });
      syncedFor.current = user.id;

      // Mirror later changes. Cart saves are debounced; failures are retried on the next change.
      let lastSent = JSON.stringify(cartPayload());
      unsubscribers.push(
        useCart.subscribe(() => {
          if (!useSession.getState().user) return; // signing out clears the device copy, not the account
          const next = JSON.stringify(cartPayload());
          if (next === lastSent) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            lastSent = next;
            api("/account/cart", { method: "PUT", body: JSON.parse(next) }).catch(() => {
              lastSent = "";
            });
          }, 600);
        }),
        useWishlist.subscribe((state, prev) => {
          if (!useSession.getState().user) return;
          const now = new Set(state.items.map((i) => i.id));
          const before = new Set(prev.items.map((i) => i.id));
          for (const id of now) if (!before.has(id)) api(`/account/wishlist/${id}`, { method: "PUT" }).catch(() => undefined);
          for (const id of before) if (!now.has(id)) api(`/account/wishlist/${id}`, { method: "DELETE" }).catch(() => undefined);
        }),
      );
    };
    start().catch(() => undefined); // offline or signed out meanwhile — the device copy still works

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribers.forEach((off) => off());
      syncedFor.current = null;
    };
  }, [user, cartReady, wishReady]);

  return null;
}
