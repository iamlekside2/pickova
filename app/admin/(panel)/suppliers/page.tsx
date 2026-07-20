import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Suppliers" };
export const dynamic = "force-dynamic";

const ADAPTER_LABELS: Record<string, string> = {
  manual: "Manual",
  "generic-rest": "REST auto-forward",
};

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">Suppliers</h1>
          <p className="text-sm text-brand-muted">{suppliers.length} suppliers.</p>
        </div>
        <Link
          href="/admin/suppliers/new"
          className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark"
        >
          <Plus size={16} /> Add supplier
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-3 font-bold">Supplier</th>
                <th className="px-4 py-3 font-bold">Fulfilment</th>
                <th className="px-4 py-3 font-bold">Products</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-brand-bg/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-brand-ink">{s.name}</div>
                    <div className="text-xs text-brand-muted">{s.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">
                    {ADAPTER_LABELS[s.adapterKey] ?? s.adapterKey} · {s.leadTimeDays}d
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{s._count.products}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        s.status === "active"
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-brand-bg text-brand-muted"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/suppliers/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line-2 px-3 py-1.5 text-[13px] font-semibold text-brand-ink hover:border-brand-green hover:text-brand-green"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
