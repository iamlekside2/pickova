"use client";

import clsx from "clsx";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductDetailDTO } from "@pickova/shared";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";
import { Price } from "./Price";

type Props = {
  product: ProductDetailDTO;
  /** Lets the gallery follow the chosen colour. */
  onColourChange?: (colourId: string) => void;
  onAdded?: () => void;
  compact?: boolean;
};

/**
 * Colour + size + quantity selection. A size MUST be chosen before anything
 * can be added, and sizes with no stock cannot be selected at all.
 */
export function VariantPicker({ product, onColourChange, onAdded, compact }: Props) {
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.lines);
  const toast = useToasts((s) => s.push);

  const firstColourInStock =
    product.colours.find((c) => product.variants.some((v) => v.colourId === c.id && v.available > 0)) ?? product.colours[0];
  const [colourId, setColourId] = useState(firstColourInStock?.id ?? "");
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);

  const variantBySize = useMemo(() => {
    const map = new Map<string, ProductDetailDTO["variants"][number]>();
    for (const v of product.variants) if (v.colourId === colourId) map.set(v.sizeId, v);
    return map;
  }, [product.variants, colourId]);

  const colour = product.colours.find((c) => c.id === colourId);
  const variant = sizeId ? variantBySize.get(sizeId) : undefined;
  const alreadyInCart = variant ? (inCart.find((l) => l.variantId === variant.id)?.quantity ?? 0) : 0;
  const canAdd = variant ? Math.max(0, variant.available - alreadyInCart) : 0;
  const soldOut = !product.inStock;

  function chooseColour(id: string) {
    setColourId(id);
    setQuantity(1);
    // Keep the size only if it is in stock in the new colour.
    if (sizeId && !(product.variants.find((v) => v.colourId === id && v.sizeId === sizeId)?.available ?? 0)) setSizeId(null);
    onColourChange?.(id);
  }

  function addToCart() {
    if (!variant) {
      setShowSizeError(true);
      return;
    }
    if (canAdd <= 0) {
      toast({ tone: "error", message: "You already have all available pairs of this size in your cart." });
      return;
    }
    const qty = Math.min(quantity, canAdd);
    const size = product.sizes.find((s) => s.id === variant.sizeId);
    const image = product.images.find((i) => i.colourId === variant.colourId) ?? product.images[0];
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sizeLabel: size?.label ?? "",
        colourName: colour?.name ?? "",
        imageUrl: image?.url ?? null,
        unitPriceKobo: variant.priceKobo,
        available: variant.available,
      },
      qty,
    );
    toast({ message: `${product.name} added to your cart.`, action: { label: "View cart", href: "/cart" } });
    setQuantity(1);
    onAdded?.();
  }

  return (
    <div className={clsx("space-y-6", compact && "space-y-5")}>
      {variant && variant.priceKobo !== product.priceKobo && <Price priceKobo={variant.priceKobo} />}

      {product.colours.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-navy">
            Colour: <span className="font-normal text-navy-500">{colour?.name}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {product.colours.map((c) => {
              const selected = c.id === colourId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => chooseColour(c.id)}
                  aria-pressed={selected}
                  aria-label={c.name}
                  title={c.name}
                  className={clsx(
                    "grid size-10 place-items-center rounded-full border-2 transition",
                    selected ? "border-orange" : "border-transparent hover:border-navy-200",
                  )}
                >
                  <span className="grid size-7 place-items-center rounded-full border border-navy-100" style={{ backgroundColor: c.hex }}>
                    {selected && <Check className="size-4 text-white mix-blend-difference" aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset aria-describedby={showSizeError && !sizeId ? "size-error" : undefined}>
        <legend className="text-sm font-medium text-navy">
          Size <span className="font-normal text-navy-500">(EU)</span>
        </legend>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {product.sizes.map((s) => {
            const v = variantBySize.get(s.id);
            const available = v?.available ?? 0;
            const selected = sizeId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={available === 0}
                aria-pressed={selected}
                aria-label={`Size ${s.label}${available === 0 ? ", sold out" : ""}`}
                onClick={() => {
                  setSizeId(s.id);
                  setQuantity(1);
                  setShowSizeError(false);
                }}
                className={clsx(
                  "relative min-h-11 rounded-xl border text-sm font-medium transition",
                  selected && "border-navy bg-navy text-white",
                  !selected && available > 0 && "border-navy-100 bg-white text-navy hover:border-navy",
                  available === 0 && "cursor-not-allowed border-line bg-offwhite text-navy-200 line-through",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {showSizeError && !sizeId && (
          <p id="size-error" role="alert" className="field-error">
            Please choose a size first.
          </p>
        )}
        {variant && variant.available > 0 && variant.available <= 3 && (
          <p className="mt-2 text-sm font-medium text-orange-700">Only {variant.available} left in this size.</p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center rounded-full border border-navy-100 bg-white" role="group" aria-label="Quantity">
          <button type="button" className="grid size-12 place-items-center rounded-full text-navy disabled:opacity-30" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">{quantity}</span>
          <button type="button" className="grid size-12 place-items-center rounded-full text-navy disabled:opacity-30" onClick={() => setQuantity((q) => q + 1)} disabled={!variant || quantity >= canAdd} aria-label="Increase quantity">
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        <button type="button" onClick={addToCart} disabled={soldOut} className="btn-primary h-12 flex-1 text-base">
          <ShoppingCart className="size-5" aria-hidden />
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
