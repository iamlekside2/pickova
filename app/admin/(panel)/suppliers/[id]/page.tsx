import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { SupplierForm, type SupplierInitial } from "../SupplierForm";
import { updateSupplier, deleteSupplier } from "../actions";

export const metadata: Metadata = { title: "Edit supplier" };
export const dynamic = "force-dynamic";

export default async function EditSupplierPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!supplier) notFound();

  const initial: SupplierInitial = {
    name: supplier.name,
    contactEmail: supplier.contactEmail,
    contactPhone: supplier.contactPhone,
    adapterKey: supplier.adapterKey,
    apiBaseUrl: supplier.apiBaseUrl,
    leadTimeDays: supplier.leadTimeDays,
    status: supplier.status,
  };
  const boundUpdate = updateSupplier.bind(null, supplier.id);
  const boundDelete = deleteSupplier.bind(null, supplier.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/suppliers"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Suppliers
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Edit supplier</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-brand-danger/40 px-3 py-2 text-[13px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/5"
          >
            <Trash2 size={15} /> Delete
          </button>
        </form>
      </div>

      {searchParams.error === "has-orders" && (
        <div className="mb-4 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          Can&apos;t delete a supplier that has orders attached.
        </div>
      )}

      <SupplierForm action={boundUpdate} initial={initial} submitLabel="Save changes" />
    </div>
  );
}
