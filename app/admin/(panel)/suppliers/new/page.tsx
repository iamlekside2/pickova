import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SupplierForm } from "../SupplierForm";
import { createSupplier } from "../actions";

export const metadata: Metadata = { title: "New supplier" };

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/suppliers"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Suppliers
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        New supplier
      </h1>
      <SupplierForm action={createSupplier} submitLabel="Create supplier" />
    </div>
  );
}
