import type { z } from "zod";
import { MAX_QTY_PER_LINE, type SavedCartDTO, type savedCartSchema } from "@pickova/shared";
import { prisma } from "../../lib/prisma";
import { quoteCart } from "../cart/quote.service";

type SaveInput = z.output<typeof savedCartSchema>;

/** The customer's saved cart, priced live so the client always gets current prices and stock. */
export async function getSavedCart(userId: string): Promise<SavedCartDTO> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { coupon: { select: { code: true } }, items: { orderBy: { createdAt: "asc" }, select: { variantId: true, quantity: true } } },
  });
  if (!cart || cart.items.length === 0) return { lines: [], couponCode: cart?.coupon?.code ?? null };
  const quote = await quoteCart({ items: cart.items });
  return { lines: quote.lines, couponCode: cart.coupon?.code ?? null };
}

/**
 * Stores the cart against the account so it follows the customer between
 * devices. With `merge`, incoming lines are added to what is already saved
 * (sign-in on a device that had a guest cart); otherwise the saved cart is
 * replaced. Quantities are only capped here — stock is enforced when the cart
 * is priced and again at checkout.
 */
export async function saveCart(userId: string, input: SaveInput): Promise<SavedCartDTO> {
  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId }, select: { id: true, items: { select: { variantId: true, quantity: true } } } });

    const wanted = new Map<string, number>();
    if (input.merge) for (const item of cart.items) wanted.set(item.variantId, item.quantity);
    for (const item of input.items) {
      const current = input.merge ? (wanted.get(item.variantId) ?? 0) : 0;
      // Merging keeps the larger of the two quantities rather than adding them,
      // so signing in twice never doubles a cart.
      wanted.set(item.variantId, Math.min(Math.max(current, item.quantity), MAX_QTY_PER_LINE));
    }

    // Ignore variants that no longer exist instead of failing the whole save.
    const existing = await tx.productVariant.findMany({ where: { id: { in: [...wanted.keys()] } }, select: { id: true } });
    const valid = new Set(existing.map((v) => v.id));

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cartItem.createMany({
      data: [...wanted].filter(([variantId]) => valid.has(variantId)).map(([variantId, quantity]) => ({ cartId: cart.id, variantId, quantity })),
    });

    if (input.couponCode !== undefined) {
      const coupon = input.couponCode ? await tx.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() }, select: { id: true } }) : null;
      await tx.cart.update({ where: { id: cart.id }, data: { couponId: coupon?.id ?? null } });
    }
  });
  return getSavedCart(userId);
}
