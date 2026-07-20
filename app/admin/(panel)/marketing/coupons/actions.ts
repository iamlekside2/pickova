"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type CouponFormState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

function parse(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const typeRaw = String(formData.get("type") ?? "percent");
  const type = typeRaw === "fixed" ? "fixed" : "percent";
  const value = Math.max(0, Math.round(Number(formData.get("value") ?? 0)));
  const active = formData.get("active") === "on";
  const usageLimit = Math.max(0, Math.round(Number(formData.get("usageLimit") ?? 0)));
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresRaw ? new Date(`${expiresRaw}T23:59:59`) : null;
  return { code, type, value, active, usageLimit, expiresAt };
}

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.code) return { error: "Coupon code is required." };
  if (d.value <= 0) return { error: "Value must be greater than zero." };

  const existing = await prisma.coupon.findUnique({ where: { code: d.code } });
  if (existing) return { error: "A coupon with that code already exists." };

  await prisma.coupon.create({
    data: {
      code: d.code,
      type: d.type,
      value: d.value,
      active: d.active,
      usageLimit: d.usageLimit,
      expiresAt: d.expiresAt,
    },
  });
  revalidatePath("/admin/marketing/coupons");
  redirect("/admin/marketing/coupons");
}

export async function updateCoupon(
  id: string,
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.code) return { error: "Coupon code is required." };
  if (d.value <= 0) return { error: "Value must be greater than zero." };

  const existing = await prisma.coupon.findUnique({ where: { code: d.code } });
  if (existing && existing.id !== id) {
    return { error: "A coupon with that code already exists." };
  }

  await prisma.coupon.update({
    where: { id },
    data: {
      code: d.code,
      type: d.type,
      value: d.value,
      active: d.active,
      usageLimit: d.usageLimit,
      expiresAt: d.expiresAt,
    },
  });
  revalidatePath("/admin/marketing/coupons");
  redirect("/admin/marketing/coupons");
}

export async function deleteCoupon(id: string): Promise<void> {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/marketing/coupons");
  redirect("/admin/marketing/coupons");
}
