import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil, Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { naira } from "@/lib/format";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

function firstImage(json: string): string {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) && arr.length ? String(arr[0]) : "";
  } catch {
    return "";
  }
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-brand-green/10 text-brand-green",
  draft: "bg-brand-bg text-brand-muted",
  out_of_stock: "bg-brand-danger/10 text-brand-danger",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-green">Products</h1>
          <p className="text-sm text-brand-muted">{products.length} products in your catalogue.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/import"
            className="flex items-center gap-2 rounded-lg border border-brand-green px-4 py-2.5 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green/5"
          >
            <Download size={16} /> Import
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark"
          >
            <Plus size={16} /> Add product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-brand-line-2 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Price</th>
                <th className="px-4 py-3 font-bold">Stock</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-line">
              {products.map((p) => {
                const img = firstImage(p.images);
                return (
                  <tr key={p.id} className="hover:bg-brand-bg/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-bg">
                          {img && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        <span className="font-semibold text-brand-ink">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-muted">{p.category.name}</td>
                    <td className="px-4 py-3 font-bold text-brand-ink">{naira(p.price)}</td>
                    <td className="px-4 py-3 text-brand-muted">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          STATUS_STYLES[p.status] ?? "bg-brand-bg text-brand-muted"
                        }`}
                      >
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
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
    </div>
  );
}
