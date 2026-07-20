"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ORDER_STATUS, SUPPLIER_ORDER_STATUS } from "@/lib/constants";
import { fulfillOrder, updateSupplierOrderStatus } from "@/lib/fulfilment/engine";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

export async function updateOrderStatus(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const status = String(formData.get("status") ?? "");
  if (!(ORDER_STATUS as readonly string[]).includes(status)) {
    redirect(`/admin/orders/${id}?error=bad-status`);
  }

  await prisma.order.update({
    where: { id },
    data: {
      status,
      // Stamp paidAt if moving into a paid state and not already stamped.
      ...(status !== "pending_payment" ? {} : {}),
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}`);
}

/** Manually trigger supplier forwarding for a paid order (e.g. retry). */
export async function forwardOrder(id: string): Promise<void> {
  await requireAdmin();
  await fulfillOrder(id);
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}`);
}

/** Update a single supplier order's fulfilment status + tracking. */
export async function updateSupplierOrder(
  orderId: string,
  supplierOrderId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const tracking = String(formData.get("trackingNumber") ?? "").trim();
  if (!(SUPPLIER_ORDER_STATUS as readonly string[]).includes(status)) {
    redirect(`/admin/orders/${orderId}?error=bad-status`);
  }
  await updateSupplierOrderStatus(supplierOrderId, status, tracking);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}`);
}

