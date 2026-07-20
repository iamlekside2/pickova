import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CouponForm } from "../CouponForm";
import { createCoupon } from "../actions";

export const metadata: Metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/marketing/coupons"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-green"
      >
        <ChevronLeft size={16} /> Coupons
      </Link>
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        New coupon
      </h1>
      <CouponForm action={createCoupon} submitLabel="Create coupon" />
    </div>
  );
}
