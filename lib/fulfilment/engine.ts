import { prisma } from "@/lib/db";
import { getAdapter, type FulfilmentItem } from "./adapters";

/**
 * Forward a PAID order to its suppliers. Idempotent — safe to call from both the
 * Paystack webhook and the checkout callback. Groups the order's items by
 * supplier, runs each supplier's adapter, records a SupplierOrder per group, and
 * rolls the order status up to "forwarded".
 */
export async function fulfillOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.status !== "paid") return;

  // Idempotency: never double-forward.
  const already = await prisma.supplierOrder.count({ where: { orderId } });
  if (already > 0) return;

  // Group items by supplier.
  const groups = new Map<string, FulfilmentItem[]>();
  for (const it of order.items) {
    if (!it.supplierId) continue; // unassigned items stay pending for admin
    const list = groups.get(it.supplierId) ?? [];
    list.push({
      name: it.name,
      price: it.price,
      qty: it.qty,
      supplierSku: it.product?.supplierSku ?? null,
    });
    groups.set(it.supplierId, list);
  }

  if (groups.size === 0) return; // nothing to forward; leave as "paid"

  for (const [supplierId, items] of groups) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) continue;

    const adapter = getAdapter(supplier.adapterKey);
    const result = await adapter.placeOrder({
      supplier,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
      },
      items,
    });

    await prisma.supplierOrder.create({
      data: {
        orderId,
        supplierId,
        externalRef: result.externalRef ?? "",
        status: result.status,
        trackingNumber: result.trackingNumber ?? "",
        payload: JSON.stringify(result.payload ?? {}),
      },
    });

    const itemStatus = result.status === "placed" ? "forwarded" : "pending";
    await prisma.orderItem.updateMany({
      where: { orderId, supplierId },
      data: { fulfilmentStatus: itemStatus },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "forwarded" },
  });
}

/**
 * Update a supplier order's status/tracking and roll the parent order forward
 * when all of its supplier orders reach a shipped/delivered state.
 */
export async function updateSupplierOrderStatus(
  supplierOrderId: string,
  status: string,
  trackingNumber?: string,
): Promise<void> {
  const so = await prisma.supplierOrder.update({
    where: { id: supplierOrderId },
    data: { status, ...(trackingNumber !== undefined ? { trackingNumber } : {}) },
  });

  const siblings = await prisma.supplierOrder.findMany({
    where: { orderId: so.orderId },
  });

  const allDelivered = siblings.every((s) => s.status === "delivered");
  const allShippedOrBeyond = siblings.every(
    (s) => s.status === "shipped" || s.status === "delivered",
  );

  if (allDelivered) {
    await prisma.order.update({ where: { id: so.orderId }, data: { status: "delivered" } });
  } else if (allShippedOrBeyond) {
    await prisma.order.update({ where: { id: so.orderId }, data: { status: "shipped" } });
  }
}
