"use client";

import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { OrderSummaryDTO, Paginated } from "@pickova/shared";
import { LoadError, Loading } from "@/components/account/AccountShell";
import { OrderRow } from "@/components/account/OrderBits";
import { useAccountData } from "@/lib/use-api";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useAccountData<Paginated<OrderSummaryDTO>>(`/account/orders?page=${page}`);

  return (
    <>
      <h1 className="text-3xl sm:text-4xl">My Orders</h1>
      <div className="mt-8">
        {loading && !data ? (
          <Loading label="Loading your orders" />
        ) : error || !data ? (
          <LoadError message={error ?? "We couldn't load your orders."} onRetry={reload} />
        ) : data.items.length === 0 ? (
          <div className="card grid place-items-center px-6 py-16 text-center">
            <Package className="size-12 text-navy-200" aria-hidden />
            <h2 className="mt-4 text-xl">No orders yet</h2>
            <p className="mt-2 max-w-sm text-sm text-navy-400">When you buy a pair, it will show up here with its delivery status.</p>
            <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
          </div>
        ) : (
          <>
            <ul className="card divide-y divide-line overflow-hidden" aria-busy={loading}>
              {data.items.map((o) => (
                <OrderRow key={o.reference} order={o} />
              ))}
            </ul>
            {data.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
                <button type="button" className="btn-outline min-h-10 px-4" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" aria-hidden /> Previous
                </button>
                <p className="text-sm text-navy-400">
                  Page <span className="font-semibold text-navy">{data.page}</span> of {data.totalPages}
                </p>
                <button type="button" className="btn-outline min-h-10 px-4" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="size-4" aria-hidden />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  );
}
