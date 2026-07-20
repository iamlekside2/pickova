"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { SUPPLIER_ADAPTERS } from "@/lib/constants";

export type SupplierFormState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

function parse(formData: FormData) {
  const adapterRaw = String(formData.get("adapterKey") ?? "manual");
  const adapterKey = (SUPPLIER_ADAPTERS as readonly string[]).includes(adapterRaw)
    ? adapterRaw
    : "manual";
  const statusRaw = String(formData.get("status") ?? "active");
  const status = statusRaw === "paused" ? "paused" : "active";

  return {
    name: String(formData.get("name") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    adapterKey,
    apiBaseUrl: String(formData.get("apiBaseUrl") ?? "").trim(),
    leadTimeDays: Math.max(0, Math.round(Number(formData.get("leadTimeDays") ?? 3))),
    status,
  };
}

export async function createSupplier(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Supplier name is required." };

  await prisma.supplier.create({ data: d });
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function updateSupplier(
  id: string,
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Supplier name is required." };

  await prisma.supplier.update({ where: { id }, data: d });
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}

export async function deleteSupplier(id: string): Promise<void> {
  await requireAdmin();
  const orders = await prisma.supplierOrder.count({ where: { supplierId: id } });
  if (orders > 0) {
    redirect(`/admin/suppliers/${id}?error=has-orders`);
  }
  // Products keep their record; their supplierId is cleared (optional relation).
  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/suppliers");
  redirect("/admin/suppliers");
}
