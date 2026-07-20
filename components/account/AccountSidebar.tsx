"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, MapPin, User, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(store)/account/actions";

const ITEMS = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Account details", href: "/account/details", icon: User },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-fit flex-col overflow-hidden rounded-card border border-brand-line-2 bg-white">
      {ITEMS.map(({ label, href, icon: Icon }) => {
        const active = href === "/account" ? pathname === "/account" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 border-b border-brand-line px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-green text-white"
                : "text-brand-ink hover:bg-brand-bg"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-bg hover:text-brand-danger"
        >
          <LogOut size={18} /> Log out
        </button>
      </form>
    </nav>
  );
}
