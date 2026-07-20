import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CategoryForm } from "../CategoryForm";
import { createCategory } from "../actions";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Categories
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        New category
      </h1>
      <CategoryForm action={createCategory} submitLabel="Create category" />
    </div>
  );
}
