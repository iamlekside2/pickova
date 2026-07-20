import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ClipboardList,
  Building2,
  Wallet,
  ArrowUpRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const PAID_STATUSES = ["paid", "forwarded", "shipped", "delivered"];

export default async function AdminDashboard() {
  const [products, orders, suppliers, paidAgg, pendingCount, recent] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.supplier.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: PAID_STATUSES } },
      }),
      prisma.order.count({ where: { status: "pending_payment" } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
    ]);

  const revenue = paidAgg._sum.total ?? 0;

  const stats = [
    { label: "Revenue (paid)", value: naira(revenue), icon: Wallet },
    { label: "Orders", value: String(orders), icon: ClipboardList, hint: `${pendingCount} pending payment` },
    { label: "Products", value: String(products), icon: Package },
    { label: "Suppliers", value: String(suppliers), icon: Building2 },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">
          Dashboard
        </h1>
        <p className="text-sm text-brand-muted">Overview of your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-card border border-brand-line-2 bg-white p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <Icon size={18} />
            </div>
            <div className="font-display text-2xl font-extrabold text-brand-ink">
              {value}
            </div>
            <div className="text-[13px] font-semibold text-brand-muted">{label}</div>
            {hint && <div className="mt-1 text-xs text-brand-muted-2">{hint}</div>}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8 rounded-card border border-brand-line-2 bg-white">
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
          <h2 className="font-display text-lg font-extrabold text-brand-green">
            Recent orders
          </h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-brand-muted-2">
            No orders yet. Orders will appear here once checkout goes live
            (Phase&nbsp;2).
          </div>
        ) : (
          <div className="divide-y divide-brand-line">
            {recent.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 text-sm"
              >
                <div>
                  <div className="font-semibold text-brand-ink">
                    {o.orderNumber}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {o.customerName || o.customerEmail || "Guest"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-brand-bg px-2.5 py-1 text-xs font-semibold capitalize text-brand-muted">
                    {o.status.replace(/_/g, " ")}
                  </span>
                  <span className="font-bold text-brand-ink">{naira(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next up */}
      <div className="mt-6 flex items-center justify-between rounded-card border border-dashed border-brand-line-2 bg-white px-5 py-4">
        <div className="text-sm text-brand-muted">
          <span className="font-bold text-brand-ink">Best-sellers & analytics</span>{" "}
          unlock once real orders start flowing in.
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1 text-[13px] font-semibold text-brand-green hover:underline"
        >
          Storefront <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
