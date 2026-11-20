import type { OrderDetailDTO, OrderSummaryDTO, Paginated } from "@pickova/shared";
import { notFound } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

export async function listOrders(userId: string, page: number, pageSize: number): Promise<Paginated<OrderSummaryDTO>> {
  const where = { userId };
  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        reference: true,
        status: true,
        createdAt: true,
        totalKobo: true,
        items: { select: { productName: true, imageUrl: true, quantity: true } },
      },
    }),
  ]);
  return {
    items: rows.map((o) => ({
      reference: o.reference,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      totalKobo: o.totalKobo,
      itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
      preview: o.items[0] ? { name: o.items[0].productName, imageUrl: o.items[0].imageUrl } : null,
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getOrder(userId: string, reference: string): Promise<OrderDetailDTO> {
  // Scoped by userId: asking for someone else's reference is simply "not found".
  const o = await prisma.order.findFirst({
    where: { userId, reference: reference.toUpperCase() },
    include: {
      items: { include: { product: { select: { slug: true, status: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!o) throw notFound("We couldn't find that order.");
  return {
    reference: o.reference,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt?.toISOString() ?? null,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    deliveryState: o.deliveryState,
    deliveryCity: o.deliveryCity,
    deliveryAddress: o.deliveryAddress,
    deliveryInstructions: o.deliveryInstructions,
    subtotalKobo: o.subtotalKobo,
    deliveryFeeKobo: o.deliveryFeeKobo,
    discountKobo: o.discountKobo,
    totalKobo: o.totalKobo,
    couponCode: o.couponCode,
    tracking: { carrier: o.trackingCarrier, number: o.trackingNumber, url: o.trackingUrl },
    items: o.items.map((i) => ({ name: i.productName, sizeLabel: i.sizeLabel, colourName: i.colourName, quantity: i.quantity, imageUrl: i.imageUrl })),
    lines: o.items.map((i) => ({
      name: i.productName,
      slug: i.product?.status === "ACTIVE" ? i.product.slug : null,
      sizeLabel: i.sizeLabel,
      colourName: i.colourName,
      imageUrl: i.imageUrl,
      unitPriceKobo: i.unitPriceKobo,
      quantity: i.quantity,
      lineTotalKobo: i.lineTotalKobo,
    })),
    timeline: o.events.map((e) => ({ status: e.status, at: e.createdAt.toISOString(), note: e.note })),
  };
}
