import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage() {
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/marketing"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Marketing
      </Link>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">Collections</h1>
          <p className="text-sm text-brand-muted">{collections.length} seasonal collections.</p>
        </div>
        <Link
          href="/admin/marketing/collections/new"
          className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark"
        >
          <Plus size={16} /> Add collection
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
              <th className="px-4 py-3 font-bold">Collection</th>
              <th className="px-4 py-3 font-bold">Slug</th>
              <th className="px-4 py-3 font-bold">Products</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {collections.map((c) => (
              <tr key={c.id} className="hover:bg-brand-bg/50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-brand-ink">
                    <span aria-hidden="true">{c.emoji} </span>{c.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted">{c.slug}</td>
                <td className="px-4 py-3 text-brand-muted">{c._count.products}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      c.active
                        ? "bg-brand-green/10 text-brand-green"
                        : "bg-brand-bg text-brand-muted"
                    }`}
                  >
                    {c.active ? "Active" : "Off-season"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/marketing/collections/${c.id}`}
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
  );
}
