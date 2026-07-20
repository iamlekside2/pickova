import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { getDefaultMarkupPercent } from "@/lib/settings";
import { ProductForm, type ProductInitial } from "../ProductForm";
import { updateProduct, deleteProduct } from "../actions";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

function parseImages(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories, collections, suppliers, defaultMarkup] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getDefaultMarkupPercent(),
  ]);

  if (!product) notFound();

  const initial: ProductInitial = {
    name: product.name,
    description: product.description,
    price: product.price,
    costPrice: product.costPrice,
    stock: product.stock,
    status: product.status,
    categoryId: product.categoryId,
    collectionId: product.collectionId,
    supplierId: product.supplierId,
    supplierSku: product.supplierSku,
    source: product.source,
    affiliateUrl: product.affiliateUrl,
    images: parseImages(product.images),
  };

  const boundUpdate = updateProduct.bind(null, product.id);
  const boundDelete = deleteProduct.bind(null, product.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Products
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">
          Edit product
        </h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-brand-danger/40 px-3 py-2 text-[13px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/5"
          >
            <Trash2 size={15} /> Delete
          </button>
        </form>
      </div>

      <ProductForm
        action={boundUpdate}
        categories={categories}
        collections={collections}
        suppliers={suppliers}
        initial={initial}
        defaultMarkup={defaultMarkup}
        submitLabel="Save changes"
      />
    </div>
  );
}
