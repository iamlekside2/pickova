"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { PackageSearch } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ORDER_STATUS_LABELS, formatNaira, trackOrderSchema, type OrderTrackingDTO, type TrackOrderInput } from "@pickova/shared";
import { ApiRequestError, api } from "@/lib/api";

const date = (iso: string) => new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

export function TrackOrderForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TrackOrderInput>({ resolver: zodResolver(trackOrderSchema) });
  const [order, setOrder] = useState<OrderTrackingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setError(null);
    setOrder(null);
    try {
      setOrder(await api<OrderTrackingDTO>("/orders/track", { method: "POST", body: values }));
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Something went wrong. Please try again.");
    }
  });

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
        <div>
          <label htmlFor="reference" className="field-label">Order reference</label>
          <input id="reference" {...register("reference")} placeholder="e.g. PKV-7F3K2Q9A" autoComplete="off" aria-invalid={errors.reference ? true : undefined} className="field-input uppercase placeholder:normal-case" />
          {errors.reference && <p role="alert" className="field-error">{errors.reference.message}</p>}
        </div>
        <div>
          <label htmlFor="track-email" className="field-label">Email used at checkout</label>
          <input id="track-email" type="email" autoComplete="email" {...register("email")} aria-invalid={errors.email ? true : undefined} className="field-input" />
          {errors.email && <p role="alert" className="field-error">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-base">
          <PackageSearch className="size-5" aria-hidden /> {isSubmitting ? "Searching…" : "Track Order"}
        </button>
        {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
      </form>

      {order && (
        <section aria-live="polite" className="card mt-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-navy-400">Order</p>
              <h2 className="text-xl">{order.reference}</h2>
              <p className="mt-1 text-sm text-navy-400">Placed {date(order.createdAt)}</p>
            </div>
            <span className="rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-navy">{ORDER_STATUS_LABELS[order.status]}</span>
          </div>

          <ul className="mt-5 space-y-1.5 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{item.quantity} × {item.name} <span className="text-navy-400">({item.colourName}, size {item.sizeLabel})</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <span className="text-navy-400">Total:</span> <span className="font-semibold">{formatNaira(order.totalKobo)}</span>
            <span className="mx-2 text-navy-200">·</span>
            <span className="text-navy-400">Delivering to</span> {order.deliveryCity}, {order.deliveryState}
          </p>

          {order.tracking.number && (
            <p className="mt-4 rounded-xl bg-offwhite px-4 py-3 text-sm">
              {order.tracking.carrier ?? "Courier"} tracking number: <span className="font-semibold">{order.tracking.number}</span>
              {order.tracking.url && (
                <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="ml-2 font-medium text-orange-700 underline underline-offset-2">Track with courier</a>
              )}
            </p>
          )}

          {order.timeline.length > 0 && (
            <ol className="mt-6 space-y-4 border-l-2 border-line pl-5">
              {order.timeline.map((event, i) => (
                <li key={i} className="relative">
                  <span className={clsx("absolute -left-[1.6875rem] top-1 size-3 rounded-full", i === order.timeline.length - 1 ? "bg-orange" : "bg-navy-200")} aria-hidden />
                  <p className="text-sm font-semibold">{ORDER_STATUS_LABELS[event.status]}</p>
                  <p className="text-xs text-navy-400">{date(event.at)}</p>
                  {event.note && <p className="mt-0.5 text-sm text-navy-500">{event.note}</p>}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
