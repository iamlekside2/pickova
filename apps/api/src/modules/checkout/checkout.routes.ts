import { Router, type Request } from "express";
import { checkoutSchema, verifyPaymentSchema } from "@pickova/shared";
import { HttpError, parse } from "../../lib/errors";
import { PaystackError, isValidWebhookSignature, verifyTransaction, type PaystackTransaction } from "../../lib/paystack";
import { prisma } from "../../lib/prisma";
import { publicWriteLimiter } from "../../middleware/security";
import { placeOrder } from "./checkout.service";
import { getPaymentOrder, settlePayment } from "./payments.service";

export const checkoutRouter = Router();

/** Guests can check out; signed-in customers get the order in their history. */
checkoutRouter.post("/checkout", publicWriteLimiter, async (req, res) => {
  const input = parse(checkoutSchema, req.body);
  res.status(201).json(await placeOrder(input, req.user?.id ?? null));
});

/**
 * Called by the result page after Paystack sends the customer back. The
 * browser supplies only the reference; whether money actually moved is asked
 * of Paystack directly, server to server.
 */
checkoutRouter.post("/payments/verify", publicWriteLimiter, async (req, res) => {
  const { reference } = parse(verifyPaymentSchema, req.body);
  await getPaymentOrder(reference); // 404 for references that aren't ours, before calling Paystack
  let tx: PaystackTransaction;
  try {
    tx = await verifyTransaction(reference);
  } catch (e) {
    if (!(e instanceof PaystackError)) throw e;
    throw new HttpError(502, "PAYMENT_GATEWAY_ERROR", "We couldn't confirm your payment just now. Please refresh this page in a moment — you will not be charged twice.");
  }
  // Use the reference we asked about, not whatever comes back.
  if (tx.reference !== reference) throw new HttpError(502, "PAYMENT_GATEWAY_ERROR", "We couldn't confirm your payment. Please contact us.");
  res.set("Cache-Control", "no-store");
  res.json(await settlePayment(tx));
});

/**
 * Paystack webhook. Authenticated by the HMAC signature over the raw body,
 * not by a session. Each event is recorded once; replays are acknowledged and
 * ignored. Always answers quickly so Paystack doesn't keep retrying.
 */
checkoutRouter.post("/webhooks/paystack", async (req: Request & { rawBody?: Buffer }, res) => {
  if (!req.rawBody || !isValidWebhookSignature(req.rawBody, req.get("x-paystack-signature"))) {
    res.status(401).json({ error: { code: "INVALID_SIGNATURE", message: "Invalid signature." } });
    return;
  }

  const event = req.body as { event?: string; data?: Partial<PaystackTransaction> };
  const type = typeof event.event === "string" ? event.event : "unknown";
  const data = event.data ?? {};
  const eventKey = `${type}:${data.reference ?? data.id ?? "none"}`;

  // Record first. If this exact event was already fully handled, stop here.
  const existing = await prisma.webhookEvent.findUnique({ where: { provider_eventKey: { provider: "paystack", eventKey } }, select: { processedAt: true } });
  if (existing?.processedAt) {
    res.json({ received: true, duplicate: true });
    return;
  }
  if (!existing) {
    await prisma.webhookEvent
      .create({ data: { provider: "paystack", eventKey, type, payload: req.body } })
      .catch(() => undefined); // a concurrent delivery created it — fine
  }

  if (type === "charge.success" && typeof data.reference === "string" && typeof data.amount === "number" && typeof data.currency === "string") {
    const known = await prisma.payment.findUnique({ where: { reference: data.reference }, select: { id: true } });
    // Payments made outside this store (same Paystack account) are not ours to process.
    if (known) await settlePayment({ ...(data as PaystackTransaction), status: "success" });
  }

  await prisma.webhookEvent.update({ where: { provider_eventKey: { provider: "paystack", eventKey } }, data: { processedAt: new Date() } });
  res.json({ received: true });
});
