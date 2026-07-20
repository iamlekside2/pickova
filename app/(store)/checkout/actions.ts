"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  isPaystackConfigured,
  initializeTransaction,
  toKobo,
  generateOrderNumber,
} from "@/lib/paystack";
import { validateCoupon } from "@/lib/coupons";
import { getCustomer } from "@/lib/customer-auth";

export type CheckoutState = { error?: string };

type IncomingItem = { id?: string; name: string; price: number; qty: number };

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3009";

export async function createCheckout(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name || !email || !phone || !address) {
    return { error: "Please fill in all your details." };
  }

  let cart: IncomingItem[] = [];
  try {
    cart = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    cart = [];
  }
  if (!Array.isArray(cart) || cart.length === 0) {
    return { error: "Your basket is empty." };
  }

  // Resolve authoritative prices from the DB (never trust client-sent prices).
  // Cart items carry DB ids; fall back to name for any legacy/static entries.
  const ids = cart.map((c) => c.id).filter((v): v is string => Boolean(v));
  const names = cart.map((c) => c.name);
  const dbProducts = await prisma.product.findMany({
    where: { OR: [{ id: { in: ids } }, { name: { in: names } }] },
  });
  const byId = new Map(dbProducts.map((p) => [p.id, p]));
  const byName = new Map(dbProducts.map((p) => [p.name, p]));

  const items = cart.map((c) => {
    const p = (c.id ? byId.get(c.id) : undefined) ?? byName.get(c.name);
    const price = p ? p.price : Math.max(0, Math.round(c.price));
    const qty = Math.max(1, Math.round(c.qty));
    return {
      productId: p?.id ?? null,
      name: c.name,
      price,
      qty,
      supplierId: p?.supplierId ?? null,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = 0; // free delivery for MVP

  // Apply coupon if provided (validated server-side against the DB).
  const couponInput = String(formData.get("coupon") ?? "");
  const coupon = await validateCoupon(couponInput, subtotal);
  if (couponInput.trim() && coupon.error) {
    return { error: coupon.error };
  }
  const discount = coupon.discount;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const orderNumber = generateOrderNumber();

  // Link the order to a signed-in customer (if any).
  const customer = await getCustomer();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer?.id ?? null,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      deliveryAddress: address,
      status: "pending_payment",
      subtotal,
      shippingFee,
      discount,
      couponCode: coupon.code,
      total,
      paystackRef: orderNumber,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
          supplierId: i.supplierId,
        })),
      },
    },
  });

  if (coupon.code) {
    await prisma.coupon.update({
      where: { code: coupon.code },
      data: { usedCount: { increment: 1 } },
    });
  }

  const callbackUrl = `${siteUrl}/checkout/callback`;

  if (isPaystackConfigured()) {
    const { authorizationUrl } = await initializeTransaction({
      email,
      amountKobo: toKobo(total),
      reference: order.paystackRef,
      callbackUrl,
      metadata: { orderNumber, orderId: order.id },
    });
    redirect(authorizationUrl);
  }

  // Mock mode — no live keys. Proceed straight to the callback in mock mode.
  redirect(`/checkout/callback?reference=${order.paystackRef}&mock=1`);
}
