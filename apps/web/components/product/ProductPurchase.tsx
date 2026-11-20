"use client";

import clsx from "clsx";
import { useState } from "react";
import type { ProductDetailDTO } from "@pickova/shared";
import { WishlistButton } from "./ProductCard";
import { ProductImage } from "./ProductImage";
import { VariantPicker } from "./VariantPicker";

/** Gallery + buy box. They share state so the gallery follows the chosen colour. */
export function ProductPurchase({ product, children }: { product: ProductDetailDTO; children: React.ReactNode }) {
  const [activeId, setActiveId] = useState(product.images[0]?.id ?? null);
  const active = product.images.find((i) => i.id === activeId) ?? product.images[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div>
        <div className="relative overflow-hidden rounded-card border border-line shadow-card">
          <ProductImage src={active?.url} alt={active?.alt || product.name} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          <WishlistButton product={product} className="absolute right-4 top-4" />
        </div>
        {product.images.length > 1 && (
          <ul className="mt-3 grid grid-cols-5 gap-3" aria-label="Product photos">
            {product.images.map((image, i) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(image.id)}
                  aria-label={`Show photo ${i + 1} of ${product.images.length}`}
                  aria-pressed={image.id === active?.id}
                  className={clsx(
                    "block w-full overflow-hidden rounded-xl border-2 transition",
                    image.id === active?.id ? "border-orange" : "border-transparent hover:border-navy-200",
                  )}
                >
                  <ProductImage src={image.url} alt="" sizes="20vw" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {children}
        <div className="mt-7">
          <VariantPicker
            product={product}
            onColourChange={(colourId) => {
              const match = product.images.find((i) => i.colourId === colourId);
              if (match) setActiveId(match.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}
