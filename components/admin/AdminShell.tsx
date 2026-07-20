"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Building2,
  Megaphone,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import type { SessionUser } from "@/lib/session";
import { logoutAction } from "@/app/admin/actions";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  ready: boolean;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, ready: true },
  { label: "Products", href: "/admin/products", icon: Package, ready: true },
  { label: "Categories", href: "/admin/categories", icon: Tags, ready: true },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList, ready: true },
  { label: "Suppliers", href: "/admin/suppliers", icon: Building2, ready: true },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone, ready: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, ready: true },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-brand-line-2 bg-white md:flex">
        <div className="border-b border-brand-line-2 px-5 py-4">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ label, href, icon: Icon, ready }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            if (!ready) {
              return (
                <span
                  key={href}
                  className="flex cursor-not-allowed items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-muted-2"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={18} /> {label}
                  </span>
                  <span className="rounded-full bg-brand-bg px-2 py-0.5 text-[10px] font-bold uppercase">
                    Soon
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-green text-white"
                    : "text-brand-ink hover:bg-brand-bg"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-brand-line-2 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold text-brand-muted hover:text-brand-green"
          >
            <ExternalLink size={16} /> View storefront
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-brand-line-2 bg-white px-5 py-3">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-bold text-brand-ink">{user.name || user.email}</div>
              <div className="text-xs capitalize text-brand-muted">{user.role}</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-brand-line-2 px-3 py-2 text-[13px] font-semibold text-brand-ink transition-colors hover:border-brand-danger hover:text-brand-danger"
              >
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
