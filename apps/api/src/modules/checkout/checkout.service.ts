import { randomInt } from "node:crypto";
import type { z } from "zod";
import { formatNaira, type CheckoutResponseDTO, type checkoutSchema } from "@pickova/shared";
import { siteUrl } from "../../env";
import { HttpError, conflict } from "../../lib/errors";
import { PaystackError, initializeTransaction, isPaystackConfigured } from "../../lib/paystack";
import { prisma } from "../../lib/prisma";
import { quoteCart } from "../cart/quote.service";

type CheckoutData = z.output<typeof checkoutSchema>;

// No 0/O or 1/I/L, so a reference read over the phone can't be mistyped.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const randomCode = (length: number) => Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/** e.g. PKV-7F3K2Q9A — about 8.5 × 10¹¹ possibilities, so not guessable. */
export const newOrderReference = () => `PKV-${randomCode(8)}`;

/**
 * Places an order awaiting payment and starts a Paystack transaction for it.
 *
 * Nothing the browser sends is trusted for money: the cart is re-priced from
 * the database here. Stock is NOT reduced yet — that happens only once the
 * payment has been verified (see payments.service.ts).
 */
export async function placeOrder(input: CheckoutData, userId: string | null): Promise<CheckoutResponseDTO> {
  if (!isPaystackConfigured()) {
    throw new HttpError(503, "PAYMENTS_UNAVAILABLE", "Online payment isn't available right now. Please try again later.");
  }

  const quote = await quoteCart({ items: input.items, state: input.state, couponCode: input.couponCode });

  if (quote.lines.length === 0 || !quote.purchasable) {
    throw conflict("Some items in your cart are no longer available. Please review your cart and try again.");
  }
  if (input.couponCode && quote.couponError) throw conflict(quote.couponError);
  if (quote.deliveryFeeKobo === null) throw conflict(`We can't deliver to ${input.state} yet. Please choose another state or contact us.`);
  if (quote.totalKobo !== input.expectedTotalKobo) {
    throw conflict(`Your order total has changed to ${formatNaira(quote.totalKobo)}. Please review it and try again.`);
  }
  if (quote.totalKobo <= 0) throw conflict("This order has nothing to pay. Please contact us to complete it.");

  const coupon = quote.coupon ? await prisma.coupon.findUnique({ where: { code: quote.coupon.code }, select: { id: true } }) : null;
  const variantSkus = new Map(
    (await prisma.productVariant.findMany({ where: { id: { in: quote.lines.map((l) => l.variantId) } }, select: { id: true, sku: true } })).map((v) => [v.id, v.sku]),
  );

  const reference = newOrderReference();
  const paymentReference = `${reference}-${randomCode(6)}`;

  await prisma.order.create({
    data: {
      reference,
      userId,
      status: "PENDING_PAYMENT",
      customerName: input.customerName,
      email: input.email,
      phone: input.phone,
      deliveryState: input.state,
      deliveryCity: input.city,
      deliveryAddress: input.address,
      deliveryInstructions: input.instructions ?? null,
      subtotalKobo: quote.subtotalKobo,
      deliveryFeeKobo: quote.deliveryFeeKobo,
      discountKobo: quote.discountKobo,
      totalKobo: quote.totalKobo,
      couponId: coupon?.id ?? null,
      couponCode: quote.coupon?.code ?? null,
      // Everything the order needs is copied in, so later product edits can't rewrite history.
      items: {
        create: quote.lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          productName: l.name,
          sku: variantSkus.get(l.variantId) ?? "",
          sizeLabel: l.sizeLabel,
          colourName: l.colourName,
          imageUrl: l.imageUrl,
          unitPriceKobo: l.unitPriceKobo,
          quantity: l.quantity,
          lineTotalKobo: l.lineTotalKobo,
        })),
      },
      events: { create: { status: "PENDING_PAYMENT", note: "Order placed, awaiting payment." } },
      payments: { create: { provider: "PAYSTACK", reference: paymentReference, amountKobo: quote.totalKobo, currency: "NGN", status: "INITIALIZED" } },
    },
  });

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: input.email,
      amountKobo: quote.totalKobo,
      reference: paymentReference,
      callbackUrl: `${siteUrl}/checkout/callback`,
      metadata: { orderReference: reference, custom_fields: [{ display_name: "Order", variable_name: "order", value: reference }] },
    });
    return { orderReference: reference, authorizationUrl };
  } catch (e) {
    // The customer never reached Paystack, so close the order rather than leave it dangling.
    console.error(`[checkout] Paystack initialise failed for ${reference}:`, e instanceof Error ? e.message : e);
    await prisma.$transaction([
      prisma.payment.update({ where: { reference: paymentReference }, data: { status: "FAILED", gatewayResponse: "Could not start payment" } }),
      prisma.order.update({
        where: { reference },
        data: { status: "CANCELLED", cancelledAt: new Date(), events: { create: { status: "CANCELLED", note: "Payment could not be started." } } },
      }),
    ]);
    if (e instanceof PaystackError) {
      throw new HttpError(502, "PAYMENT_GATEWAY_ERROR", "We couldn't start your payment. You have not been charged — please try again.");
    }
    throw e;
  }
}
