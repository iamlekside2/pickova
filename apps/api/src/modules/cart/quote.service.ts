import type { Coupon } from "@prisma/client";
import { MAX_QTY_PER_LINE, formatNaira, type CartQuoteDTO, type CartQuoteLineDTO } from "@pickova/shared";
import { prisma } from "../../lib/prisma";

type QuoteInput = {
  items: { variantId: string; quantity: number }[];
  state?: string;
  couponCode?: string;
};

/** Returns the discount in kobo, or a customer-facing reason it does not apply. */
export function evaluateCoupon(coupon: Coupon | null, subtotalKobo: number, now = new Date()): { discountKobo: number } | { error: string } {
  if (!coupon || !coupon.isActive) return { error: "That code isn't valid." };
  if (coupon.startsAt && coupon.startsAt > now) return { error: "That code isn't active yet." };
  if (coupon.expiresAt && coupon.expiresAt <= now) return { error: "That code has expired." };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { error: "That code has been fully redeemed." };
  if (subtotalKobo < coupon.minSubtotalKobo) {
    return { error: `Spend at least ${formatNaira(coupon.minSubtotalKobo)} to use this code.` };
  }
  let discount = coupon.type === "PERCENT" ? Math.floor((subtotalKobo * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscountKobo !== null) discount = Math.min(discount, coupon.maxDiscountKobo);
  return { discountKobo: Math.min(discount, subtotalKobo) };
}

/**
 * Prices a cart entirely from the database. The client only ever sends variant
 * ids and quantities — names, prices, stock, delivery fees and discounts are
 * all looked up here, so nothing the browser claims is trusted. Checkout
 * (Phase 4) builds the order from this same function.
 */
export async function quoteCart(input: QuoteInput): Promise<CartQuoteDTO> {
  // Merge duplicate lines before pricing.
  const wanted = new Map<string, number>();
  for (const item of input.items) wanted.set(item.variantId, (wanted.get(item.variantId) ?? 0) + item.quantity);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...wanted.keys()] } },
    select: {
      id: true,
      isActive: true,
      priceOverrideKobo: true,
      size: { select: { label: true } },
      colour: { select: { id: true, name: true } },
      inventory: { select: { quantity: true } },
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          priceKobo: true,
          images: { orderBy: { sortOrder: "asc" }, select: { url: true, colourId: true } },
        },
      },
    },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: CartQuoteLineDTO[] = [];
  for (const [variantId, requested] of wanted) {
    const v = byId.get(variantId);
    if (!v) continue; // variant no longer exists — drop the line
    const buyable = v.isActive && v.product.status === "ACTIVE";
    const stock = buyable ? (v.inventory?.quantity ?? 0) : 0;
    const available = Math.min(stock, MAX_QTY_PER_LINE);
    const quantity = Math.min(requested, available);
    const unitPriceKobo = v.priceOverrideKobo ?? v.product.priceKobo;
    const image = v.product.images.find((i) => i.colourId === v.colour.id) ?? v.product.images[0];
    lines.push({
      variantId,
      productId: v.product.id,
      slug: v.product.slug,
      name: v.product.name,
      sizeLabel: v.size.label,
      colourName: v.colour.name,
      imageUrl: image?.url ?? null,
      unitPriceKobo,
      quantity,
      available,
      lineTotalKobo: unitPriceKobo * quantity,
      issue: !buyable ? "UNAVAILABLE" : available === 0 ? "OUT_OF_STOCK" : quantity < requested ? "QUANTITY_REDUCED" : null,
    });
  }

  const subtotalKobo = lines.reduce((sum, l) => sum + l.lineTotalKobo, 0);

  let discountKobo = 0;
  let coupon: CartQuoteDTO["coupon"] = null;
  let couponError: string | null = null;
  if (input.couponCode) {
    const found = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
    const result = evaluateCoupon(found, subtotalKobo);
    if ("error" in result) couponError = result.error;
    else {
      discountKobo = result.discountKobo;
      coupon = { code: found!.code, description: found!.description };
    }
  }

  let deliveryFeeKobo: number | null = null;
  if (input.state && subtotalKobo > 0) {
    const [zone, threshold] = await Promise.all([
      prisma.deliveryZone.findFirst({ where: { state: input.state, isActive: true } }),
      prisma.storeSetting.findUnique({ where: { key: "freeDeliveryThresholdKobo" } }),
    ]);
    if (zone) {
      const free = typeof threshold?.value === "number" && threshold.value > 0 && subtotalKobo - discountKobo >= threshold.value;
      deliveryFeeKobo = free ? 0 : zone.feeKobo;
    }
  }

  return {
    lines,
    subtotalKobo,
    deliveryFeeKobo,
    discountKobo,
    totalKobo: subtotalKobo - discountKobo + (deliveryFeeKobo ?? 0),
    coupon,
    couponError,
    purchasable: lines.length > 0 && lines.every((l) => l.issue === null),
  };
}
