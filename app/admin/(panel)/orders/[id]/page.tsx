import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";
import { ORDER_STATUS, SUPPLIER_ORDER_STATUS } from "@/lib/constants";
import { updateOrderStatus, forwardOrder, updateSupplierOrder } from "../actions";

export const metadata: Metadata = { title: "Order" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, supplierOrders: { include: { supplier: true } } },
  });
  if (!order) notFound();

  const boundUpdate = updateOrderStatus.bind(null, order.id);
  const boundForward = forwardOrder.bind(null, order.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-brand-muted capitalize">
            {order.status.replace(/_/g, " ")}
          </p>
        </div>
        <form action={boundUpdate} className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-lg border border-brand-line-2 bg-white px-3 py-2 text-sm font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            {ORDER_STATUS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-green px-4 py-2 text-sm font-bold text-white hover:bg-brand-green-dark"
          >
            Update
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* Items */}
        <div className="rounded-card border border-brand-line-2 bg-white">
          <div className="border-b border-brand-line px-5 py-3 font-display font-bold text-brand-green">
            Items
          </div>
          <div className="divide-y divide-brand-line">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="text-brand-ink">
                  {it.name} <span className="text-brand-muted-2">× {it.qty}</span>
                </span>
                <span className="font-semibold text-brand-ink">{naira(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-brand-line px-5 py-4 text-sm">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal</span>
              <span>{naira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Delivery</span>
              <span>{order.shippingFee === 0 ? "Free" : naira(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-green">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>−{naira(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-extrabold text-brand-ink">
              <span>Total</span>
              <span>{naira(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="h-fit rounded-card border border-brand-line-2 bg-white p-5">
          <div className="mb-3 font-display font-bold text-brand-green">Customer</div>
          <dl className="space-y-2 text-sm">
            <Row label="Name" value={order.customerName || "—"} />
            <Row label="Email" value={order.customerEmail || "—"} />
            <Row label="Phone" value={order.customerPhone || "—"} />
            <Row label="Address" value={order.deliveryAddress || "—"} />
            <Row label="Paystack ref" value={order.paystackRef || "—"} />
          </dl>
        </div>
      </div>

      {/* Fulfilment */}
      <div className="mt-6 rounded-card border border-brand-line-2 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-brand-line px-5 py-3">
          <div className="font-display font-bold text-brand-green">Fulfilment</div>
          {order.status === "paid" && order.supplierOrders.length === 0 && (
            <form action={boundForward}>
              <button
                type="submit"
                className="rounded-lg bg-brand-green px-3.5 py-2 text-[13px] font-bold text-white hover:bg-brand-green-dark"
              >
                Forward to suppliers
              </button>
            </form>
          )}
        </div>

        {order.supplierOrders.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-brand-muted-2">
            {order.status === "pending_payment"
              ? "Awaiting payment — nothing forwarded yet."
              : "Not forwarded to any supplier yet."}
          </div>
        ) : (
          <div className="divide-y divide-brand-line">
            {order.supplierOrders.map((so) => {
              const boundSO = updateSupplierOrder.bind(null, order.id, so.id);
              return (
                <div key={so.id} className="px-5 py-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-brand-ink">{so.supplier.name}</div>
                      <div className="text-xs text-brand-muted">
                        {so.supplier.adapterKey}
                        {so.externalRef ? ` · ref ${so.externalRef}` : ""}
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-semibold capitalize text-brand-muted">
                      {so.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <form action={boundSO} className="flex flex-wrap items-center gap-2">
                    <select
                      name="status"
                      defaultValue={so.status}
                      className="rounded-lg border border-brand-line-2 bg-white px-2.5 py-1.5 text-[13px] font-semibold text-brand-ink outline-none focus:border-brand-green"
                    >
                      {SUPPLIER_ORDER_STATUS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <input
                      name="trackingNumber"
                      defaultValue={so.trackingNumber}
                      placeholder="Tracking #"
                      className="min-w-[140px] flex-1 rounded-lg border border-brand-line-2 bg-white px-2.5 py-1.5 text-[13px] text-brand-ink outline-none focus:border-brand-green"
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-brand-line-2 px-3 py-1.5 text-[13px] font-semibold text-brand-ink hover:border-brand-green hover:text-brand-green"
                    >
                      Update
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-muted-2">{label}</dt>
      <dd className="text-brand-ink">{value}</dd>
    </div>
  );
}
