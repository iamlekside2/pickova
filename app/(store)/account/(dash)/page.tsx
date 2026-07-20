import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

const CARDS = [
  { label: "Orders", href: "/account/orders", icon: Package, blurb: "Track your recent orders" },
  { label: "Addresses", href: "/account/addresses", icon: MapPin, blurb: "Manage your delivery address" },
  { label: "Account details", href: "/account/details", icon: User, blurb: "Edit your name & password" },
];

export default async function AccountDashboardPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  const orderCount = await prisma.order.count({
    where: { OR: [{ customerId: customer.id }, { customerEmail: customer.email }] },
  });

  const firstName = customer.name.split(" ")[0] || "there";

  return (
    <div>
      <p className="mb-1 text-lg text-brand-ink">
        Hello <span className="font-bold">{firstName}</span> 👋
      </p>
      <p className="mb-6 max-w-prose text-sm leading-relaxed text-brand-muted">
        From your account dashboard you can view your{" "}
        <Link href="/account/orders" className="font-semibold text-brand-green hover:underline">
          recent orders
        </Link>
        , manage your{" "}
        <Link href="/account/addresses" className="font-semibold text-brand-green hover:underline">
          delivery address
        </Link>
        , and edit your{" "}
        <Link href="/account/details" className="font-semibold text-brand-green hover:underline">
          password and account details
        </Link>
        .
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map(({ label, href, icon: Icon, blurb }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 rounded-card border border-brand-line-2 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-green hover:shadow-[0_10px_24px_rgba(10,61,38,0.10)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-bg text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-white">
              <Icon size={20} />
            </span>
            <span className="text-sm font-bold text-brand-ink">{label}</span>
            <span className="text-xs text-brand-muted">
              {label === "Orders" ? `${orderCount} order${orderCount === 1 ? "" : "s"}` : blurb}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
