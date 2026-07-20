"use client";

import Link from "next/link";
import { X, Lock } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { naira } from "@/lib/format";
import { NEUTRAL_THEME } from "@/lib/theme";

/** Slide-in mini-cart drawer. Persistent across routes (mounted in layout). */
export function CartDrawer() {
  const { items, isOpen, closeCart, changeQty, removeItem, subtotal, count } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[rgba(10,61,38,0.45)] animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 z-40 flex h-full w-[380px] max-w-[92vw] flex-col bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.2)] animate-slide-in"
        role="dialog"
        aria-label="Your basket"
      >
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-5">
          <div className="font-display text-lg font-extrabold text-brand-green">
            Your Basket {count > 0 && <span className="text-brand-muted">({count})</span>}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close basket"
            className="text-brand-muted hover:text-brand-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="px-2.5 py-16 text-center text-brand-muted-2">
              <div className="mb-2.5 text-3xl">🛍️</div>
              <div className="text-sm">
                Your basket is empty.
                <br />
                Go pick something fine.
              </div>
            </div>
          ) : (
            items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-[#F5F1E5] py-3"
                >
                  <div
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px]"
                    style={{
                      background: `linear-gradient(135deg, ${NEUTRAL_THEME.themeFrom}, ${NEUTRAL_THEME.themeTo})`,
                    }}
                  >
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 truncate text-sm font-bold text-brand-ink">
                      {item.name}
                    </div>
                    <div className="text-sm font-extrabold text-brand-gold">
                      {naira(item.price)}
                    </div>
                    <div className="mt-2 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="h-6 w-6 rounded-md border border-brand-line-2 bg-white text-sm"
                      >
                        −
                      </button>
                      <span className="min-w-[14px] text-center text-[13px] font-semibold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="h-6 w-6 rounded-md border border-brand-line-2 bg-white text-sm"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs text-brand-danger underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-line px-5 py-5">
            <div className="mb-3.5 flex items-center justify-between text-[15px] font-bold text-brand-ink">
              <span>Subtotal</span>
              <span>{naira(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover"
            >
              <Lock size={16} />
              Checkout · Pay with Paystack
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
