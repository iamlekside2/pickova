import { prisma } from "@/lib/db";

export type CouponResult = {
  code: string; // normalized code if valid, else ""
  discount: number; // in naira
  error?: string;
};

/**
 * Validate a coupon against a subtotal. Returns the discount amount (never
 * exceeding the subtotal) or an error. Empty code = no coupon, no error.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { code: "", discount: 0 };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return { code: "", discount: 0, error: "That coupon isn't valid." };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { code: "", discount: 0, error: "That coupon has expired." };
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { code: "", discount: 0, error: "That coupon has been fully used." };
  }

  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  return { code: coupon.code, discount: Math.min(discount, subtotal) };
}
