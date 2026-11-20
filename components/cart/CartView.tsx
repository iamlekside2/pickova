"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { getDeliveryZone } from "@/data/delivery";
import { ProductImage } from "@/components/product/ProductImage";
import { Field } from "@/components/ui/Form";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { quoteCart } from "@/lib/catalog";
import { MAX_QTY_PER_LINE, NIGERIAN_STATES, formatNaira, orderDetailsSchema, type OrderDetails, type OrderDetailsInput } from "@/lib/shared";
import { buildOrderMessage, hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";
import { useCart } from "@/stores/cart";

/** Delivery details are remembered on this device so repeat orders are quicker. */
const DETAILS_KEY = "pickova-order-details";

function loadSavedDetails(): Partial<OrderDetailsInput> {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DETAILS_KEY) ?? "{}") as Record<string, unknown>;
    const text = (key: string) => (typeof saved[key] === "string" ? (saved[key] as string) : undefined);
    const state = NIGERIAN_STATES.find((s) => s === saved.state);
    return { customerName: text("customerName"), phone: text("phone"), state, city: text("city"), address: text("address") };
  } catch {
    return {};
  }
}

export function CartView() {
  const { lines, hydrated, setQuantity, remove } = useCart();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<OrderDetailsInput, unknown, OrderDetails>({
    resolver: zodResolver(orderDetailsSchema),
  });
  const state = watch("state");

  useEffect(() => {
    if (hydrated) reset(loadSavedDetails());
  }, [hydrated, reset]);

  // Names, prices and availability always come from the current catalogue.
  const quote = useMemo(() => quoteCart(lines, state), [lines, state]);
  const zone = getDeliveryZone(state);

  const submit = handleSubmit((details) => {
    if (!quote.orderable) return;
    const { note: _note, ...remember } = details;
    window.localStorage.setItem(DETAILS_KEY, JSON.stringify(remember));
    // Opens WhatsApp with the order typed out; the customer reviews it and presses send.
    window.open(whatsappUrl(buildOrderMessage(quote, details)), "_blank", "noopener,noreferrer");
  });

  if (!hydrated) {
    return <div className="mt-8 h-64 animate-pulse rounded-card bg-navy-50" aria-busy="true" aria-label="Loading your cart" />;
  }

  if (quote.lines.length === 0) {
    return (
      <div className="card mt-8 grid place-items-center px-6 py-16 text-center">
        <ShoppingBag className="size-12 text-navy-200" aria-hidden />
        <h2 className="mt-4 text-xl">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-navy-400">Find a pair you love and it will show up here.</p>
        <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_26rem]">
      <ul className="card divide-y divide-line">
        {quote.lines.map((line) => {
          const blocked = line.issue !== null;
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

                {blocked && (
                  <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-danger">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> This size is sold out. Remove it to continue.
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="inline-flex h-10 items-center rounded-full border border-navy-100" role="group" aria-label={`Quantity for ${line.name}`}>
                    <button type="button" className="grid size-10 place-items-center rounded-full disabled:opacity-30" disabled={blocked || line.quantity <= 1} onClick={() => setQuantity(line.variantId, line.quantity - 1)} aria-label="Decrease quantity">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                    <button type="button" className="grid size-10 place-items-center rounded-full disabled:opacity-30" disabled={blocked || line.quantity >= MAX_QTY_PER_LINE} onClick={() => setQuantity(line.variantId, line.quantity + 1)} aria-label="Increase quantity">
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

      <form onSubmit={submit} noValidate aria-labelledby="order-heading" className="card space-y-5 p-6 lg:sticky lg:top-24">
        <div>
          <h2 id="order-heading" className="text-xl">Complete your order</h2>
          <p className="mt-1 text-sm text-navy-400">Tell us where to deliver, then send the order to us on WhatsApp.</p>
        </div>

        <Field name="customerName" label="Full name" autoComplete="name" register={register} errors={errors} />
        <Field name="phone" label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" register={register} errors={errors} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label htmlFor="state" className="field-label">State</label>
            <select id="state" {...register("state")} defaultValue="" aria-invalid={errors.state ? true : undefined} aria-describedby={errors.state ? "state-error" : undefined} className="field-input">
              <option value="" disabled>Choose a state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state && <p id="state-error" role="alert" className="field-error">{errors.state.message}</p>}
          </div>
          <Field name="city" label="City / Town" autoComplete="address-level2" register={register} errors={errors} />
        </div>
        <Field name="address" label="Delivery address" autoComplete="street-address" placeholder="House number, street, area" register={register} errors={errors} />
        <Field name="note" label="Note (optional)" placeholder="Landmark, best time to call…" register={register} errors={errors} />

        <dl className="space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy-400">Subtotal</dt>
            <dd className="font-medium">{formatNaira(quote.subtotalKobo)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy-400">Delivery (estimate)</dt>
            <dd className="font-medium">
              {quote.deliveryFeeKobo === null ? <span className="font-normal text-navy-400">Choose a state</span> : formatNaira(quote.deliveryFeeKobo)}
            </dd>
          </div>
          {zone && (
            <p className="text-xs text-navy-400">
              Usually {zone.etaMinDays}–{zone.etaMaxDays} working days to {zone.state}.
            </p>
          )}
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <dt className="text-base font-semibold">Estimated total</dt>
            <dd className="text-2xl font-bold text-orange-600">{formatNaira(quote.totalKobo)}</dd>
          </div>
        </dl>

        {!quote.orderable && (
          <p role="alert" className="text-sm font-medium text-danger">Remove the sold-out item above to continue.</p>
        )}

        <button type="submit" disabled={!quote.orderable || !hasWhatsApp} className="btn h-[3.25rem] w-full bg-[#1FAF5A] text-base text-white shadow-[0_10px_30px_-8px_rgba(31,175,90,0.6)] hover:bg-[#178F49] active:scale-[0.98]">
          <WhatsAppIcon className="size-6" /> Order on WhatsApp
        </button>
        <p className="text-center text-xs leading-relaxed text-navy-400">
          WhatsApp opens with your order written out — just press send. We&apos;ll reply to confirm availability, the delivery fee and how to pay.
        </p>
        <Link href="/shop" className="block rounded text-center text-sm font-medium text-navy underline underline-offset-4 hover:text-orange-700">
          Continue shopping
        </Link>
      </form>
    </div>
  );
}
