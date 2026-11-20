import { Router } from "express";
import { trackOrderSchema, type OrderTrackingDTO } from "@pickova/shared";
import { notFound, parse } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { publicWriteLimiter } from "../../middleware/security";

export const trackingRouter = Router();

/**
 * Guest order lookup. Requires the reference AND the email used at checkout,
 * and returns no contact details — only what is needed to follow a delivery.
 */
trackingRouter.post("/orders/track", publicWriteLimiter, async (req, res) => {
  const { reference, email } = parse(trackOrderSchema, req.body);
  const order = await prisma.order.findFirst({
    where: { reference, email: { equals: email, mode: "insensitive" } },
    select: {
      reference: true,
      status: true,
      createdAt: true,
      totalKobo: true,
      deliveryState: true,
      deliveryCity: true,
      trackingCarrier: true,
      trackingNumber: true,
      trackingUrl: true,
      items: { select: { productName: true, sizeLabel: true, colourName: true, quantity: true, imageUrl: true } },
      events: { orderBy: { createdAt: "asc" }, select: { status: true, createdAt: true, note: true } },
    },
  });
  if (!order) throw notFound("We couldn't find an order with that reference and email.");

  const dto: OrderTrackingDTO = {
    reference: order.reference,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    totalKobo: order.totalKobo,
    deliveryState: order.deliveryState,
    deliveryCity: order.deliveryCity,
    tracking: { carrier: order.trackingCarrier, number: order.trackingNumber, url: order.trackingUrl },
    items: order.items.map((i) => ({
      name: i.productName,
      sizeLabel: i.sizeLabel,
      colourName: i.colourName,
      quantity: i.quantity,
      imageUrl: i.imageUrl,
    })),
    timeline: order.events.map((e) => ({ status: e.status, at: e.createdAt.toISOString(), note: e.note })),
  };
  res.set("Cache-Control", "no-store");
  res.json(dto);
});
