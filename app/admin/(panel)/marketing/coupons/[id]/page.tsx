import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { CouponForm, type CouponInitial } from "../CouponForm";
import { updateCoupon, deleteCoupon } from "../actions";

export const metadata: Metadata = { title: "Edit coupon" };
export const dynamic = "force-dynamic";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) notFound();

  const initial: CouponInitial = {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    active: coupon.active,
    usageLimit: coupon.usageLimit,
    expiresAt: toDateInput(coupon.expiresAt),
  };
  const boundUpdate = updateCoupon.bind(null, coupon.id);
  const boundDelete = deleteCoupon.bind(null, coupon.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/marketing/coupons"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Coupons
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold text-brand-green">Edit coupon</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg border border-brand-danger/40 px-3 py-2 text-[13px] font-semibold text-brand-danger transition-colors hover:bg-brand-danger/5"
          >
            <Trash2 size={15} /> Delete
          </button>
        </form>
      </div>

      <CouponForm action={boundUpdate} initial={initial} submitLabel="Save changes" />
    </div>
  );
}
