"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Star, Eye, Share2, ArrowRight } from "lucide-react";
import type { Product, Season } from "@/lib/types";
import { naira, normalizeRating } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

type ProductCardProps = {
  product: Product;
  season: Pick<Season, "themeFrom" | "themeTo">;
};

export function ProductCard({ product, season }: ProductCardProps) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const rating = normalizeRating(product.rating);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/products/${product.id}`
        : `/products/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user dismissed share sheet — ignore
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-card bg-brand-card shadow-[0_1px_0_rgba(10,102,64,0.08)] transition-shadow hover:shadow-[0_10px_30px_rgba(10,61,38,0.12)]">
      {/* Image + overlays */}
      <div className="relative h-[180px]">
        <ImagePlaceholder
          from={season.themeFrom}
          to={season.themeTo}
          src={product.image}
          category={product.category}
          label={product.name}
        />

        {/* Category tag badge (top-left) */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-[rgba(10,61,38,0.75)] px-2.5 py-1 text-[11px] font-bold text-white">
          {product.category}
        </span>

        {/* Wishlist (top-right) */}
        <button
          type="button"
          onClick={() => setWishlisted((w) => !w)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-ink transition-colors hover:bg-white"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-brand-gold text-brand-gold" : ""}
          />
        </button>

        {/* Hover actions: quick view + share */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/40 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            href={`/products/${product.id}`}
            aria-label="View product"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-ink transition-colors hover:bg-white"
          >
            <Eye size={16} />
          </Link>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share product"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-ink transition-colors hover:bg-white"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-[15px] font-bold leading-tight text-brand-ink hover:text-brand-green"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={14}
              className={
                i < Math.round(rating)
                  ? "fill-brand-gold text-brand-gold"
                  : "text-brand-line-2"
              }
            />
          ))}
          <span className="ml-1 text-xs font-medium text-brand-muted">{rating.toFixed(1)}</span>
        </div>

        <div className="font-display text-lg font-extrabold text-brand-gold">
          {naira(product.price)}
        </div>

        {/* Pick It (gold CTA) */}
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover"
        >
          Pick It
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
