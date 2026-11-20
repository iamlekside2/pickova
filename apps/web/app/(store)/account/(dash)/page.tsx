"use client";

import { Heart, MapPin, Package } from "lucide-react";
import Link from "next/link";
import type { AccountOverviewDTO } from "@pickova/shared";
import { LoadError, Loading } from "@/components/account/AccountShell";
import { OrderRow } from "@/components/account/OrderBits";
import { useAccountData } from "@/lib/use-api";
import { useSession } from "@/stores/session";

export default function AccountDashboardPage() {
  const user = useSession((s) => s.user);
  const { data, error, loading, reload } = useAccountData<AccountOverviewDTO>("/account/overview");

  return (
    <>
      <h1 className="text-3xl sm:text-4xl">{user ? `Hello, ${user.firstName}` : "My Account"}</h1>
      <p className="mt-2 text-navy-400">Track your orders, manage your addresses and update your details.</p>

      <div className="mt-8">
        {loading ? (
          <Loading label="Loading your account" />
        ) : error || !data ? (
          <LoadError message={error ?? "We couldn't load your account."} onRetry={reload} />
        ) : (
          <div className="space-y-8">
            <ul className="grid gap-4 sm:grid-cols-3">
              {[
                { href: "/account/orders", icon: Package, value: data.orderCount, label: data.orderCount === 1 ? "Order" : "Orders" },
                { href: "/wishlist", icon: Heart, value: data.wishlistCount, label: "Saved to wishlist" },
                { href: "/account/addresses", icon: MapPin, value: data.addressCount, label: data.addressCount === 1 ? "Saved address" : "Saved addresses" },
              ].map(({ href, icon: Icon, value, label }) => (
                <li key={href}>
                  <Link href={href} className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-card-hover">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
                      <Icon className="size-[1.375rem]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-2xl font-bold leading-none">{value}</span>
                      <span className="mt-1 block text-sm text-navy-400">{label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <section aria-labelledby="recent-orders">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="recent-orders" className="text-xl">Recent orders</h2>
                {data.orderCount > 0 && (
                  <Link href="/account/orders" className="rounded text-sm font-medium text-orange-700 underline underline-offset-2">View all</Link>
                )}
              </div>
              {data.recentOrders.length > 0 ? (
                <ul className="card divide-y divide-line overflow-hidden">
                  {data.recentOrders.map((o) => (
                    <OrderRow key={o.reference} order={o} />
                  ))}
                </ul>
              ) : (
                <div className="card px-6 py-10 text-center">
                  <p className="text-navy-400">You haven&apos;t placed an order yet.</p>
                  <Link href="/shop" className="btn-primary mt-5">Start shopping</Link>
                </div>
              )}
            </section>

            <section aria-labelledby="default-address">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="default-address" className="text-xl">Default delivery address</h2>
                <Link href="/account/addresses" className="rounded text-sm font-medium text-orange-700 underline underline-offset-2">
                  {data.defaultAddress ? "Manage" : "Add address"}
                </Link>
              </div>
              <div className="card p-5 text-sm leading-relaxed">
                {data.defaultAddress ? (
                  <>
                    <p className="font-semibold">{data.defaultAddress.recipientName}</p>
                    <p className="text-navy-500">{data.defaultAddress.line1}</p>
                    <p className="text-navy-500">{data.defaultAddress.city}, {data.defaultAddress.state}</p>
                    <p className="text-navy-500">{data.defaultAddress.phone}</p>
                  </>
                ) : (
                  <p className="text-navy-400">Save an address now for faster checkout later.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
