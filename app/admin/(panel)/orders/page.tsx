import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-brand-bg text-brand-muted",
  paid: "bg-brand-green/10 text-brand-green",
  forwarded: "bg-brand-gold/15 text-brand-gold-deep",
  shipped: "bg-brand-gold/15 text-brand-gold-deep",
  delivered: "bg-brand-green/10 text-brand-green",
  cancelled: "bg-brand-danger/10 text-brand-danger",
  refunded: "bg-brand-danger/10 text-brand-danger",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Orders</h1>
        <p className="text-sm text-brand-muted">{orders.length} orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-card border border-brand-line-2 bg-white px-5 py-16 text-center text-sm text-brand-muted-2">
          No orders yet. They&apos;ll appear here as customers check out.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                  <th className="px-4 py-3 font-bold">Order</th>
                  <th className="px-4 py-3 font-bold">Customer</th>
                  <th className="px-4 py-3 font-bold">Items</th>
                  <th className="px-4 py-3 font-bold">Total</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-bg/50">
                    <td className="px-4 py-3 font-semibold text-brand-ink">{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-brand-ink">{o.customerName || "Guest"}</div>
                      <div className="text-xs text-brand-muted">{o.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{o._count.items}</td>
                    <td className="px-4 py-3 font-bold text-brand-ink">{naira(o.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[o.status] ?? "bg-brand-bg text-brand-muted"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line-2 px-3 py-1.5 text-[13px] font-semibold text-brand-ink hover:border-brand-green hover:text-brand-green"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
