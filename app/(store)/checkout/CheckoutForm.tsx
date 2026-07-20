"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ShieldCheck, Lock } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { naira } from "@/lib/format";
import { createCheckout, type CheckoutState } from "./actions";

const labelCls = "text-[13px] font-bold text-brand-ink";
const inputCls =
  "w-full rounded-lg border border-brand-line-2 bg-white px-3.5 py-3 text-sm text-brand-ink outline-none focus:border-brand-green";

function PayButton({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-4 py-3.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover disabled:opacity-60"
    >
      <Lock size={16} />
      {pending ? "Starting payment…" : `Pay ${naira(total)} with Paystack`}
    </button>
  );
}

type CheckoutDefaults = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export function CheckoutForm({ defaults }: { defaults?: CheckoutDefaults }) {
  const { items, subtotal } = useCart();
  const [state, formAction] = useFormState(createCheckout, {} as CheckoutState);

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-brand-line-2 bg-white px-6 py-16 text-center">
        <div className="mb-2.5 text-3xl">🛍️</div>
        <p className="mb-5 text-brand-muted">Your basket is empty.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-green-dark"
        >
          Start picking
        </Link>
      </div>
    );
  }

  const total = subtotal; // free delivery (MVP)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      {/* Details form */}
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="cart" value={JSON.stringify(items)} />

        {state.error && (
          <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
            {state.error}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Full name</span>
          <input name="name" required autoComplete="name" defaultValue={defaults?.name} placeholder="Chidinma Okafor" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Email</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={defaults?.email} placeholder="you@email.com" className={inputCls} />
          <span className="text-xs text-brand-muted-2">Your Paystack receipt goes here.</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Phone number</span>
          <input name="phone" required autoComplete="tel" defaultValue={defaults?.phone} placeholder="080X XXX XXXX" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Delivery address</span>
          <textarea name="address" required rows={2} defaultValue={defaults?.address} placeholder="No. 4, Allen Avenue, Ikeja, Lagos" className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Coupon code (optional)</span>
          <input name="coupon" placeholder="e.g. WELCOME10" className={`${inputCls} uppercase`} />
          <span className="text-xs text-brand-muted-2">Discount is applied when you pay.</span>
        </label>

        <div className="mt-1 flex items-center gap-2 rounded-lg border border-[#DCEFE3] bg-[#F5FBF7] px-3.5 py-3 text-sm">
          <ShieldCheck size={18} className="text-brand-green" />
          <span className="font-bold text-brand-green">Pay with Paystack</span>
          <span className="text-xs text-brand-muted">Card · Bank Transfer · USSD</span>
        </div>

        <PayButton total={total} />
      </form>

      {/* Summary */}
      <div className="h-fit rounded-card border border-brand-line-2 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-extrabold text-brand-green">
          Order summary
        </h2>
        <div className="flex flex-col gap-3">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3 text-sm">
              <span className="text-brand-muted">
                {i.name} <span className="text-brand-muted-2">× {i.qty}</span>
              </span>
              <span className="font-semibold text-brand-ink">{naira(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between border-t border-brand-line pt-3 text-sm text-brand-muted">
          <span>Delivery</span>
          <span className="font-semibold text-brand-green">Free</span>
        </div>
        <div className="mt-2 flex justify-between text-lg font-extrabold text-brand-ink">
          <span>Total</span>
          <span>{naira(total)}</span>
        </div>
      </div>
    </div>
  );
}
