import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultMarkupPercent } from "@/lib/settings";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";

export const metadata: Metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, collections, suppliers, defaultMarkup] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getDefaultMarkupPercent(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Products
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        New product
      </h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        collections={collections}
        suppliers={suppliers}
        defaultMarkup={defaultMarkup}
        submitLabel="Create product"
      />
    </div>
  );
}
