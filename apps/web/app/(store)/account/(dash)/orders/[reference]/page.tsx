"use client";

import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUS_LABELS, formatNaira, type OrderDetailDTO } from "@pickova/shared";
import { LoadError, Loading } from "@/components/account/AccountShell";
import { StatusBadge, formatDateTime } from "@/components/account/OrderBits";
import { ProductImage } from "@/components/product/ProductImage";
import { useAccountData } from "@/lib/use-api";

export default function OrderDetailPage({ params }: { params: { reference: string } }) {
  const { data: order, error, loading, reload } = useAccountData<OrderDetailDTO>(`/account/orders/${encodeURIComponent(params.reference)}`);

  return (
    <>
      <Link href="/account/orders" className="inline-flex items-center gap-1 rounded text-sm font-medium text-navy-500 hover:text-orange-700">
        <ChevronLeft className="size-4" aria-hidden /> All orders
      </Link>

      {loading ? (
        <div className="mt-6"><Loading label="Loading order" /></div>
      ) : error || !order ? (
        <div className="mt-6"><LoadError message={error ?? "We couldn't load this order."} onRetry={reload} /></div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl">Order {order.reference}</h1>
              <p className="mt-1 text-sm text-navy-400">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <StatusBadge status={order.status} className="px-4 py-1.5 text-sm" />
          </div>

          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
            <div className="space-y-6">
              <section aria-labelledby="items-heading" className="card overflow-hidden">
                <h2 id="items-heading" className="border-b border-line px-5 py-4 text-lg">Items</h2>
                <ul className="divide-y divide-line">
                  {order.lines.map((line, i) => (
                    <li key={i} className="flex gap-4 p-4 sm:p-5">
                      <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage src={line.imageUrl} alt="" sizes="80px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug">
                          {line.slug ? <Link href={`/products/${line.slug}`} className="rounded hover:text-orange-700">{line.name}</Link> : line.name}
                        </p>
                        <p className="mt-1 text-sm text-navy-400">{line.colourName} · Size {line.sizeLabel} · Qty {line.quantity}</p>
                      </div>
                      <p className="shrink-0 text-right font-semibold">{formatNaira(line.lineTotalKobo)}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {order.timeline.length > 0 && (
                <section aria-labelledby="timeline-heading" className="card p-5">
                  <h2 id="timeline-heading" className="text-lg">Order progress</h2>
                  {order.tracking.number && (
                    <p className="mt-3 rounded-xl bg-offwhite px-4 py-3 text-sm">
                      {order.tracking.carrier ?? "Courier"} tracking number: <span className="font-semibold">{order.tracking.number}</span>
                      {order.tracking.url && (
                        <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="ml-2 font-medium text-orange-700 underline underline-offset-2">Track with courier</a>
                      )}
                    </p>
                  )}
                  <ol className="mt-5 space-y-4 border-l-2 border-line pl-5">
                    {order.timeline.map((event, i) => (
                      <li key={i} className="relative">
                        <span className={clsx("absolute -left-[1.6875rem] top-1 size-3 rounded-full", i === order.timeline.length - 1 ? "bg-orange" : "bg-navy-200")} aria-hidden />
                        <p className="text-sm font-semibold">{ORDER_STATUS_LABELS[event.status]}</p>
                        <p className="text-xs text-navy-400">{formatDateTime(event.at)}</p>
                        {event.note && <p className="mt-0.5 text-sm text-navy-500">{event.note}</p>}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section aria-labelledby="summary-heading" className="card p-5">
                <h2 id="summary-heading" className="text-lg">Summary</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><dt className="text-navy-400">Subtotal</dt><dd>{formatNaira(order.subtotalKobo)}</dd></div>
                  {order.discountKobo > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-navy-400">Discount{order.couponCode && ` (${order.couponCode})`}</dt>
                      <dd className="text-success">−{formatNaira(order.discountKobo)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between"><dt className="text-navy-400">Delivery</dt><dd>{order.deliveryFeeKobo === 0 ? "Free" : formatNaira(order.deliveryFeeKobo)}</dd></div>
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <dt className="font-semibold">Total</dt>
                    <dd className="text-xl font-bold text-orange-600">{formatNaira(order.totalKobo)}</dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby="delivery-heading" className="card p-5 text-sm leading-relaxed">
                <h2 id="delivery-heading" className="mb-3 text-lg">Delivery</h2>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-navy-500">{order.deliveryAddress}</p>
                <p className="text-navy-500">{order.deliveryCity}, {order.deliveryState}</p>
                <p className="text-navy-500">{order.phone}</p>
                {order.deliveryInstructions && <p className="mt-2 text-navy-400">Note: {order.deliveryInstructions}</p>}
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
