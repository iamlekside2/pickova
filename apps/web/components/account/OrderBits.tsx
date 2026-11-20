import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUS_LABELS, formatNaira, type OrderStatus, type OrderSummaryDTO } from "@pickova/shared";
import { ProductImage } from "@/components/product/ProductImage";

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
export const formatDateTime = (iso: string) => new Date(iso).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-orange-100 text-orange-700",
  PAID: "bg-navy-50 text-navy",
  PROCESSING: "bg-navy-50 text-navy",
  SHIPPED: "bg-navy text-white",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-danger/10 text-danger",
  REFUNDED: "bg-navy-100 text-navy-500",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLE[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderRow({ order }: { order: OrderSummaryDTO }) {
  return (
    <li>
      <Link href={`/account/orders/${order.reference}`} className="group flex items-center gap-4 p-4 transition hover:bg-offwhite sm:p-5">
        <div className="w-16 shrink-0 overflow-hidden rounded-xl sm:w-20">
          <ProductImage src={order.preview?.imageUrl} alt="" sizes="80px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold">{order.reference}</span>
            <StatusBadge status={order.status} />
          </p>
          <p className="mt-1 truncate text-sm text-navy-400">
            {order.preview?.name}
            {order.itemCount > 1 && ` + ${order.itemCount - 1} more`}
          </p>
          <p className="mt-0.5 text-sm text-navy-400">
            {formatDate(order.createdAt)} · <span className="font-medium text-navy">{formatNaira(order.totalKobo)}</span>
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-navy-300 transition group-hover:translate-x-1 group-hover:text-orange" aria-hidden />
      </Link>
    </li>
  );
}
