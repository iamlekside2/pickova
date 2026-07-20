import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { CategoryForm, type CategoryInitial } from "../CategoryForm";
import { updateCategory, deleteCategory } from "../actions";

export const metadata: Metadata = { title: "Edit category" };
export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) notFound();

  const productCount = category._count.products;
  const initial: CategoryInitial = {
    name: category.name,
    icon: category.icon,
    blurb: category.blurb,
    sortOrder: category.sortOrder,
  };
  const boundUpdate = updateCategory.bind(null, category.id);
  const boundDelete = deleteCategory.bind(null, category.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Categories
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Edit category</h1>
        {productCount === 0 ? (
          <form action={boundDelete}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border border-brand-danger/40 px-3 py-2 text-[13px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/5"
            >
              <Trash2 size={15} /> Delete
            </button>
          </form>
        ) : (
          <span className="text-xs text-brand-muted-2">
            {productCount} product{productCount === 1 ? "" : "s"} — reassign before deleting
          </span>
        )}
      </div>

      {searchParams.error === "has-products" && (
        <div className="mb-4 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          Can&apos;t delete a category that still has products. Move them to another
          category first.
        </div>
      )}

      <CategoryForm action={boundUpdate} initial={initial} submitLabel="Save changes" />
    </div>
  );
}
