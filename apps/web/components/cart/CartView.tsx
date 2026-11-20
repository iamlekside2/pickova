"use client";

import { CircleAlert, Lock, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NIGERIAN_STATES, formatNaira, type CartQuoteDTO, type DeliveryZoneDTO } from "@pickova/shared";
import { ProductImage } from "@/components/product/ProductImage";
import { ApiRequestError, api } from "@/lib/api";
import { useCart } from "@/stores/cart";

const STATE_KEY = "pickova-delivery-state";

const ISSUE_TEXT: Record<NonNullable<CartQuoteDTO["lines"][number]["issue"]>, string> = {
  OUT_OF_STOCK: "This size has just sold out. Remove it to continue.",
  UNAVAILABLE: "This product is no longer available. Remove it to continue.",
  QUANTITY_REDUCED: "We reduced the quantity to what's left in stock.",
};

export function CartView() {
  const { lines, couponCode, hydrated, setQuantity, remove, sync, setCoupon } = useCart();
  const [quote, setQuote] = useState<CartQuoteDTO | null>(null);
  const [zones, setZones] = useState<DeliveryZoneDTO[]>([]);
  const [state, setState] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // What the server needs to price the cart — ids and quantities only.
  const requestKey = useMemo(
    () => JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), state: state || undefined, couponCode: couponCode ?? undefined }),
    [lines, state, couponCode],
  );

  useEffect(() => {
    setState(window.localStorage.getItem(STATE_KEY) ?? "");
    api<DeliveryZoneDTO[]>("/store/delivery-zones").then(setZones).catch(() => setZones([]));
  }, []);

  // Re-price on the server whenever the cart, state or coupon changes.
  useEffect(() => {
    if (!hydrated) return;
    if (lines.length === 0) {
      setQuote(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    api<CartQuoteDTO>("/cart/quote", { method: "POST", body: JSON.parse(requestKey), signal: controller.signal })
      .then((fresh) => {
        setError(null);
        setQuote(fresh);
        // Adopt server truth for prices and stock; keep unbuyable lines visible so the shopper sees why.
        const changed = fresh.lines.some((f) => {
          const local = lines.find((l) => l.variantId === f.variantId);
          return !local || local.unitPriceKobo !== f.unitPriceKobo || local.available !== f.available || (f.quantity > 0 && local.quantity !== f.quantity);
        });
        if (changed || fresh.lines.length !== lines.length) {
          sync(
            fresh.lines.map((f) => ({
              variantId: f.variantId,
              productId: f.productId,
              slug: f.slug,
              name: f.name,
              sizeLabel: f.sizeLabel,
              colourName: f.colourName,
              imageUrl: f.imageUrl,
              unitPriceKobo: f.unitPriceKobo,
              quantity: Math.max(1, f.quantity),
              available: f.available,
            })),
          );
        }
      })
      .catch((e) => {
        if (e instanceof ApiRequestError) setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
    // `lines` is represented by requestKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, hydrated]);

  function chooseState(value: string) {
    setState(value);
    window.localStorage.setItem(STATE_KEY, value);
  }

  function applyCoupon(e: FormEvent) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code) setCoupon(code);
    setCouponInput("");
  }

  if (!hydrated) {
    return <div className="mt-8 h-64 animate-pulse rounded-card bg-navy-50" aria-busy="true" aria-label="Loading your cart" />;
  }

  if (lines.length === 0) {
    return (
      <div className="card mt-8 grid place-items-center px-6 py-16 text-center">
        <ShoppingBag className="size-12 text-navy-200" aria-hidden />
        <h2 className="mt-4 text-xl">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-navy-400">Find a pair you love and it will show up here.</p>
        <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  const issues = new Map(quote?.lines.map((l) => [l.variantId, l.issue]));
  const zone = zones.find((z) => z.state === state);
  const subtotal = quote?.subtotalKobo ?? lines.reduce((n, l) => n + l.unitPriceKobo * l.quantity, 0);

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
      <ul className="card divide-y divide-line">
        {lines.map((line) => {
          const issue = issues.get(line.variantId) ?? null;
          const blocked = issue === "OUT_OF_STOCK" || issue === "UNAVAILABLE";
          return (
            <li key={line.variantId} className="flex gap-4 p-4 sm:p-5">
              <Link href={`/products/${line.slug}`} className="w-24 shrink-0 overflow-hidden rounded-2xl sm:w-28" tabIndex={-1} aria-hidden="true">
                <ProductImage src={line.imageUrl} alt="" sizes="112px" className={blocked ? "opacity-50" : undefined} />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-snug">
                      <Link href={`/products/${line.slug}`} className="rounded hover:text-orange-700">{line.name}</Link>
                    </h2>
                    <p className="mt-1 text-sm text-navy-400">
                      {line.colourName} · Size {line.sizeLabel}
                    </p>
                  </div>
                  <button type="button" onClick={() => remove(line.variantId)} aria-label={`Remove ${line.name} from cart`} className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-danger">
                    <Trash2 className="size-[1.125rem]" aria-hidden />
                  </button>
                </div>

                {issue && (
                  <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {ISSUE_TEXT[issue]}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="inline-flex h-10 items-center rounded-full border border-navy-100" role="group" aria-label={`Quantity for ${line.name}`}>
                    <button type="button" className="grid size-10 place-items-center rounded-full disabled:opacity-30" disabled={blocked || line.quantity <= 1} onClick={() => setQuantity(line.variantId, line.quantity - 1)} aria-label="Decrease quantity">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                    <button type="button" className="grid size-10 place-items-center rounded-full disabled:opacity-30" disabled={blocked || line.quantity >= line.available} onClick={() => setQuantity(line.variantId, line.quantity + 1)} aria-label="Increase quantity">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                  <p className="text-right">
                    <span className="block font-bold text-navy">{formatNaira(line.unitPriceKobo * line.quantity)}</span>
                    {line.quantity > 1 && <span className="block text-xs text-navy-400">{formatNaira(line.unitPriceKobo)} each</span>}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="summary-heading" className="card p-6 lg:sticky lg:top-24">
        <h2 id="summary-heading" className="text-xl">Order Summary</h2>

        <div className="mt-5">
          <label htmlFor="delivery-state" className="field-label">Deliver to</label>
          <select id="delivery-state" value={state} onChange={(e) => chooseState(e.target.value)} className="field-input">
            <option value="">Choose your state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {zone && (
            <p className="mt-1.5 text-xs text-navy-400">
              Estimated delivery: {zone.etaMinDays}–{zone.etaMaxDays} working days
            </p>
          )}
        </div>

        <div className="mt-5">
          {quote?.coupon ? (
            <p className="flex items-center justify-between gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-navy">
                <Tag className="size-4 text-orange-600" aria-hidden /> {quote.coupon.code}
                <span className="font-normal text-navy-400">{quote.coupon.description}</span>
              </span>
              <button type="button" onClick={() => setCoupon(null)} aria-label="Remove discount code" className="grid size-8 place-items-center rounded-full hover:bg-white">
                <X className="size-4" aria-hidden />
              </button>
            </p>
          ) : (
            <form onSubmit={applyCoupon}>
              <label htmlFor="coupon" className="field-label">Discount code</label>
              <div className="flex gap-2">
                <input id="coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} maxLength={40} autoComplete="off" placeholder="Enter code" className="field-input uppercase placeholder:normal-case" />
                <button type="submit" className="btn-outline shrink-0 px-5" disabled={!couponInput.trim()}>Apply</button>
              </div>
              {couponCode && quote?.couponError && (
                <p role="alert" className="field-error">{quote.couponError}</p>
              )}
            </form>
          )}
        </div>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm" aria-busy={loading}>
          <div className="flex justify-between">
            <dt className="text-navy-400">Subtotal</dt>
            <dd className="font-medium">{formatNaira(subtotal)}</dd>
          </div>
          {quote && quote.discountKobo > 0 && (
            <div className="flex justify-between">
              <dt className="text-navy-400">Discount</dt>
              <dd className="font-medium text-success">−{formatNaira(quote.discountKobo)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-navy-400">Delivery</dt>
            <dd className="font-medium">
              {quote?.deliveryFeeKobo == null ? <span className="font-normal text-navy-400">Choose a state</span> : quote.deliveryFeeKobo === 0 ? "Free" : formatNaira(quote.deliveryFeeKobo)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <dt className="text-base font-semibold">Total</dt>
            <dd className="text-2xl font-bold text-orange-600">{formatNaira(quote?.totalKobo ?? subtotal)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">{error}</p>
        )}

        {/* Checkout and Paystack payment are delivered in Phase 4. The button is
            disabled — never a dead link — until that flow exists. */}
        <button type="button" disabled className="btn-primary mt-6 h-12 w-full text-base" aria-describedby="checkout-note">
          <Lock className="size-4" aria-hidden /> Proceed to Checkout
        </button>
        <p id="checkout-note" className="mt-3 text-center text-xs text-navy-400">
          Online checkout opens soon. Prices and stock above are confirmed live by our server.
        </p>
        <Link href="/shop" className="mt-4 block rounded text-center text-sm font-medium text-navy underline underline-offset-4 hover:text-orange-700">
          Continue shopping
        </Link>
      </section>
    </div>
  );
}
