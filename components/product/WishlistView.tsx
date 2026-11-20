"use client";

import { Heart, X } from "lucide-react";
import Link from "next/link";
import { getProduct } from "@/lib/catalog";
import { useWishlist } from "@/stores/wishlist";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";

export function WishlistView() {
  const { slugs, hydrated, remove } = useWishlist();

  if (!hydrated) return <div className="mt-8 h-64 animate-pulse rounded-card bg-navy-50" aria-busy="true" aria-label="Loading your wishlist" />;

  // Products that have since left the catalogue simply drop out.
  const items = slugs.map((slug) => getProduct(slug)).filter((p) => p !== null);

  if (items.length === 0) {
    return (
      <div className="card mt-8 grid place-items-center px-6 py-16 text-center">
        <Heart className="size-12 text-navy-200" aria-hidden />
        <h2 className="mt-4 text-xl">Nothing saved yet</h2>
        <p className="mt-2 max-w-sm text-sm text-navy-400">Tap the heart on any pair to save it here for later.</p>
        <Link href="/shop" className="btn-primary mt-6">Browse sneakers</Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="card group relative flex flex-col overflow-hidden">
          <ProductImage src={item.image?.url} alt="" />
          <button type="button" onClick={() => remove(item.slug)} aria-label={`Remove ${item.name} from wishlist`} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/95 text-navy shadow-card hover:text-danger">
            <X className="size-5" aria-hidden />
          </button>
          <div className="flex flex-1 flex-col p-4">
            <h2 className="text-[0.9375rem] font-semibold leading-snug">
              <Link href={`/products/${item.slug}`} className="rounded after:absolute after:inset-0 hover:text-orange-700">{item.name}</Link>
            </h2>
            <Price priceKobo={item.priceKobo} compareAtKobo={item.compareAtPriceKobo} className="mt-2" />
            <span className="mt-3 text-sm font-medium text-orange-700">Choose size →</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
