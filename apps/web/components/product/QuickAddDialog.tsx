"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductDetailDTO, ProductSummaryDTO } from "@pickova/shared";
import { ApiRequestError, api } from "@/lib/api";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";
import { VariantPicker } from "./VariantPicker";

/** Size/colour chooser opened from a product card's "Add to Cart" button. */
export function QuickAddDialog({ product, onClose }: { product: ProductSummaryDTO; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<ProductDetailDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colourId, setColourId] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api<ProductDetailDTO>(`/products/${encodeURIComponent(product.slug)}`, { signal: controller.signal })
      .then(setDetail)
      .catch((e) => {
        if (e instanceof ApiRequestError) setError(e.message);
      });
    return () => controller.abort();
  }, [product.slug]);

  const image = detail?.images.find((i) => i.colourId === colourId) ?? detail?.images[0] ?? product.image;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="quick-add-title"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-card p-0 text-navy shadow-card-hover backdrop:bg-navy-900/60"
    >
      <div className="relative p-5 sm:p-6">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-navy hover:bg-navy-50">
          <X className="size-5" aria-hidden />
        </button>
        <div className="flex gap-4 pr-10">
          <ProductImage src={image?.url} alt={image?.alt ?? product.name} className="w-28 shrink-0 rounded-2xl" />
          <div className="min-w-0">
            <h2 id="quick-add-title" className="text-lg leading-snug">{product.name}</h2>
            <Price priceKobo={product.priceKobo} compareAtKobo={product.compareAtPriceKobo} className="mt-1" />
            <Link href={`/products/${product.slug}`} className="mt-1 inline-block rounded text-sm font-medium text-navy-500 underline underline-offset-2 hover:text-orange-700">
              View full details
            </Link>
          </div>
        </div>
        <div className="mt-6">
          {error ? (
            <p role="alert" className="text-sm text-danger">{error}</p>
          ) : detail ? (
            <VariantPicker product={detail} compact onColourChange={setColourId} onAdded={onClose} />
          ) : (
            <div className="space-y-3" aria-busy="true" aria-label="Loading sizes">
              <div className="h-5 w-24 animate-pulse rounded bg-navy-50" />
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded-xl bg-navy-50" />
                ))}
              </div>
              <div className="h-12 animate-pulse rounded-full bg-navy-50" />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
