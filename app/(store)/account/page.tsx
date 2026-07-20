import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";
import { naira } from "@/lib/format";
import { logoutAction } from "./actions";

export const metadata: Metadata = { title: "My account" };
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

export default async function AccountPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  // Orders linked by id or matched by email (covers guest checkouts).
  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: customer.id }, { customerEmail: customer.email }],
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">
            Hi, {customer.name.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-brand-muted">{customer.email}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-brand-line-2 px-3.5 py-2 text-[13px] font-semibold text-brand-ink transition-colors hover:border-brand-danger hover:text-brand-danger"
          >
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>

      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-brand-green">
        <Package size={20} /> Your orders
      </h2>

      {orders.length === 0 ? (
        <div className="rounded-card border border-brand-line-2 bg-white px-5 py-14 text-center text-sm text-brand-muted-2">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/" className="font-bold text-brand-green hover:underline">
            Start picking
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
          <div className="divide-y divide-brand-line">
            {orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-semibold text-brand-ink">{o.orderNumber}</div>
                  <div className="text-xs text-brand-muted">
                    {o._count.items} item{o._count.items === 1 ? "" : "s"} ·{" "}
                    {o.createdAt.toISOString().slice(0, 10)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      STATUS_STYLES[o.status] ?? "bg-brand-bg text-brand-muted"
                    }`}
                  >
                    {o.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-bold text-brand-ink">{naira(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
