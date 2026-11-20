"use client";

import clsx from "clsx";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { discountPercent, type ProductSummaryDTO } from "@/lib/shared";
import { useToasts } from "@/stores/toast";
import { useWishlist } from "@/stores/wishlist";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";
import { QuickAddDialog } from "./QuickAddDialog";

export function WishlistButton({ product, className }: { product: Pick<ProductSummaryDTO, "slug" | "name">; className?: string }) {
  const saved = useWishlist((s) => s.hydrated && s.slugs.includes(product.slug));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useToasts((s) => s.push);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      onClick={() => {
        toggle(product.slug);
        toast(saved ? { message: "Removed from your wishlist." } : { message: "Saved to your wishlist.", action: { label: "View", href: "/wishlist" } });
      }}
      className={clsx(
        "grid size-10 place-items-center rounded-full bg-white/95 shadow-card transition hover:scale-105",
        saved ? "text-orange-600" : "text-navy hover:text-orange-600",
        className,
      )}
    >
      <Heart className={clsx("size-5", saved && "fill-orange")} aria-hidden />
    </button>
  );
}

export function ProductCard({ product, priority }: { product: ProductSummaryDTO; priority?: boolean }) {
  const [quickAdd, setQuickAdd] = useState(false);
  const discount = discountPercent(product.priceKobo, product.compareAtPriceKobo);

  return (
    <article className="card group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductImage
            src={product.image?.url}
            alt=""
            priority={priority}
            className={clsx("transition duration-500 group-hover:scale-[1.04]", !product.inStock && "opacity-60")}
          />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount !== null && (
            <span className="rounded-full bg-orange px-2.5 py-1 text-xs font-semibold text-white">-{discount}%</span>
          )}
          {product.isNewArrival && <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-semibold text-white">New</span>}
        </div>
        {/* z-10 keeps it above the card-wide link overlay */}
        <WishlistButton product={product} className="absolute right-3 top-3 z-10" />
        {!product.inStock && (
          <span className="absolute inset-x-3 bottom-3 rounded-full bg-navy/90 py-1.5 text-center text-xs font-medium text-white">Sold out</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <Link href={`/products/${product.slug}`} className="rounded after:absolute after:inset-0 after:z-0 hover:text-orange-700">
            {product.name}
          </Link>
        </h3>
        {product.colours.length > 0 && (
          <ul className="mt-2 flex items-center gap-1.5" aria-label="Available colours">
            {product.colours.slice(0, 5).map((c) => (
              <li key={c.id} className="size-3.5 rounded-full border border-navy-100" style={{ backgroundColor: c.hex }} title={c.name}>
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-3">
          <Price priceKobo={product.priceKobo} compareAtKobo={product.compareAtPriceKobo} />
          <button
            type="button"
            onClick={() => setQuickAdd(true)}
            disabled={!product.inStock}
            className="btn-navy relative z-10 mt-3 min-h-10 w-full px-4 text-[0.8125rem]"
            aria-label={`Add ${product.name} to cart — choose a size`}
          >
            <ShoppingCart className="size-4" aria-hidden />
            Add to Cart
          </button>
        </div>
      </div>
      {quickAdd && <QuickAddDialog product={product} onClose={() => setQuickAdd(false)} />}
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductSummaryDTO[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="w-full [&>article]:h-full">
            <ProductCard product={p} priority={i < priorityCount} />
          </div>
        </li>
      ))}
    </ul>
  );
}
