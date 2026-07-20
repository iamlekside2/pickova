import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";
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

export default async function AccountOrdersPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: { OR: [{ customerId: customer.id }, { customerEmail: customer.email }] },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-extrabold text-brand-green">Orders</h2>

      {orders.length === 0 ? (
        <div className="rounded-card border border-brand-line-2 bg-white px-5 py-14 text-center text-sm text-brand-muted-2">
          No orders yet.{" "}
          <Link href="/" className="font-bold text-brand-green hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                  <th className="px-4 py-3 font-bold">Order</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-brand-bg/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-ink">{o.orderNumber}</div>
                      <div className="text-xs text-brand-muted">
                        {o._count.items} item{o._count.items === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">
                      {o.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[o.status] ?? "bg-brand-bg text-brand-muted"
                        }`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-brand-ink">
                      {naira(o.total)}
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
