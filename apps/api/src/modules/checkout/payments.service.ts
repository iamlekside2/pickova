import type { Prisma } from "@prisma/client";
import type { PaymentResultDTO } from "@pickova/shared";
import { notFound } from "../../lib/errors";
import type { PaystackTransaction } from "../../lib/paystack";
import { prisma } from "../../lib/prisma";
import { sendOrderEmails } from "./order-emails";

const orderSelect = {
  reference: true,
  status: true,
  totalKobo: true,
  email: true,
  deliveryCity: true,
  deliveryState: true,
  items: { select: { productName: true, sizeLabel: true, colourName: true, quantity: true, imageUrl: true } },
} satisfies Prisma.OrderSelect;

type OrderRow = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

function emailHint(email: string): string {
  const [name = "", domain = ""] = email.split("@");
  return `${name.charAt(0)}${"•".repeat(Math.max(3, Math.min(name.length - 1, 6)))}@${domain}`;
}

function toResult(order: OrderRow, outcome: PaymentResultDTO["outcome"], message: string): PaymentResultDTO {
  return {
    outcome,
    message,
    order: {
      reference: order.reference,
      status: order.status,
      totalKobo: order.totalKobo,
      emailHint: emailHint(order.email),
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      items: order.items.map((i) => ({ name: i.productName, sizeLabel: i.sizeLabel, colourName: i.colourName, quantity: i.quantity, imageUrl: i.imageUrl })),
    },
  };
}

/** Looks up the order behind a payment reference, for the result page. */
export async function getPaymentOrder(paymentReference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference: paymentReference },
    select: { status: true, order: { select: orderSelect } },
  });
  if (!payment) throw notFound("We couldn't find that payment.");
  return payment;
}

/**
 * Applies a transaction reported by Paystack (from the verify API or a signed
 * webhook) to our records. This is the ONLY place an order becomes PAID.
 *
 * Safe to call any number of times, from the callback page and the webhook at
 * once: the payment row is claimed with a conditional update inside the
 * transaction, so exactly one caller marks the order paid, takes the stock and
 * sends the confirmation email.
 */
export async function settlePayment(tx: PaystackTransaction): Promise<PaymentResultDTO> {
  const payment = await prisma.payment.findUnique({
    where: { reference: tx.reference },
    select: { id: true, status: true, amountKobo: true, currency: true, orderId: true, order: { select: orderSelect } },
  });
  if (!payment) throw notFound("We couldn't find that payment.");

  // Already settled (webhook and callback both arrive) — nothing more to do.
  if (payment.status === "SUCCESS") return toResult(payment.order, "PAID", "Payment confirmed.");

  if (tx.status !== "success") {
    const stillOpen = tx.status === "ongoing" || tx.status === "pending" || tx.status === "processing" || tx.status === "queued";
    if (!stillOpen) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: "INITIALIZED" },
        data: { status: tx.status === "abandoned" ? "ABANDONED" : "FAILED", gatewayResponse: tx.gateway_response ?? tx.status, channel: tx.channel ?? null },
      });
    }
    return toResult(
      payment.order,
      stillOpen ? "PENDING" : "FAILED",
      stillOpen ? "Your payment is still being processed. This page will update shortly." : "Your payment was not completed. You have not been charged.",
    );
  }

  // A "success" only counts if it is for exactly what we asked: same amount, in naira.
  if (tx.amount !== payment.amountKobo || tx.currency !== payment.currency) {
    console.error(`[payments] MISMATCH on ${tx.reference}: expected ${payment.amountKobo} ${payment.currency}, Paystack reports ${tx.amount} ${tx.currency}`);
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { id: payment.id, status: "INITIALIZED" },
        data: { status: "FAILED", gatewayResponse: `Amount/currency mismatch: ${tx.amount} ${tx.currency}`, raw: tx as unknown as Prisma.InputJsonValue },
      }),
      prisma.orderStatusEvent.create({
        data: { orderId: payment.orderId, status: "PENDING_PAYMENT", note: `Payment ${tx.reference} rejected: amount or currency did not match the order. Needs review.` },
      }),
    ]);
    return toResult(payment.order, "FAILED", "We couldn't confirm your payment. If you were charged, please contact us with your order reference.");
  }

  const claimed = await prisma.$transaction(async (db) => {
    const claim = await db.payment.updateMany({
      where: { id: payment.id, status: { not: "SUCCESS" } },
      data: {
        status: "SUCCESS",
        channel: tx.channel ?? null,
        gatewayResponse: tx.gateway_response ?? null,
        paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
        raw: tx as unknown as Prisma.InputJsonValue,
      },
    });
    if (claim.count !== 1) return false; // another request settled it a moment ago

    const order = await db.order.findUniqueOrThrow({
      where: { id: payment.orderId },
      select: { id: true, status: true, userId: true, couponId: true, items: { select: { variantId: true, quantity: true, productName: true, sizeLabel: true } } },
    });

    // Take stock. Each decrement only succeeds if enough is left, so stock can
    // never go negative even when two customers pay for the last pair at once.
    const shortfalls: string[] = [];
    for (const item of order.items) {
      if (!item.variantId) continue;
      const taken = await db.inventory.updateMany({
        where: { variantId: item.variantId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (taken.count !== 1) shortfalls.push(`${item.productName} (size ${item.sizeLabel}) × ${item.quantity}`);
    }

    if (order.couponId) await db.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });

    // A cancelled/refunded order that later receives money must not silently reopen.
    const wasOpen = order.status === "PENDING_PAYMENT";
    await db.order.update({
      where: { id: order.id },
      data: {
        ...(wasOpen ? { status: "PAID" } : {}),
        paidAt: new Date(),
        events: {
          create: [
            { status: wasOpen ? "PAID" : order.status, note: wasOpen ? "Payment confirmed by Paystack." : `Payment received while order was ${order.status}. Needs review (refund or reinstate).` },
            ...(shortfalls.length
              ? [{ status: wasOpen ? ("PAID" as const) : order.status, note: `Stock shortfall after payment — needs review: ${shortfalls.join("; ")}.` }]
              : []),
          ],
        },
      },
    });

    // The cart has been bought: empty the saved copy.
    if (order.userId) await db.cartItem.deleteMany({ where: { cart: { userId: order.userId } } });
    return true;
  });

  const fresh = await prisma.order.findUniqueOrThrow({ where: { id: payment.orderId }, select: orderSelect });
  // Only the request that won the claim sends the email, so it goes out once.
  if (claimed) void sendOrderEmails(payment.orderId);
  return toResult(fresh, "PAID", "Payment confirmed.");
}
