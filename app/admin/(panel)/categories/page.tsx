import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { resolveIcon } from "@/lib/icons";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">Categories</h1>
          <p className="text-sm text-brand-muted">{categories.length} categories.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark"
        >
          <Plus size={16} /> Add category
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
              <th className="px-4 py-3 font-bold">Category</th>
              <th className="px-4 py-3 font-bold">Slug</th>
              <th className="px-4 py-3 font-bold">Products</th>
              <th className="px-4 py-3 font-bold text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {categories.map((c) => {
              const Icon = resolveIcon(c.icon);
              return (
                <tr key={c.id} className="hover:bg-brand-bg/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="font-semibold text-brand-ink">{c.name}</div>
                        <div className="text-xs text-brand-muted">{c.blurb}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{c.slug}</td>
                  <td className="px-4 py-3 text-brand-muted">{c._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-line-2 px-3 py-1.5 text-[13px] font-semibold text-brand-ink hover:border-brand-green hover:text-brand-green"
                    >
                      <Pencil size={14} /> Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
