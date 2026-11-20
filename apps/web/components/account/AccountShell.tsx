"use client";

import clsx from "clsx";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { useWishlist } from "@/stores/wishlist";

const LINKS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile Settings", icon: UserCog },
];

/** Signs out and wipes this device's copy of the cart and wishlist (they stay saved in the account). */
export function useSignOut() {
  const router = useRouter();
  return async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    useSession.getState().setUser(null);
    useCart.getState().clear();
    useWishlist.setState({ items: [] });
    router.push("/");
    router.refresh();
  };
}

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useSession((s) => s.user);
  const signOut = useSignOut();

  return (
    <div className="container-page pb-4 pt-8 sm:pt-10">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* min-w-0 lets the tab strip scroll sideways on phones instead of widening the page */}
        <aside className="min-w-0">
          <div className="card p-3 lg:sticky lg:top-24">
            <div className="hidden border-b border-line px-3 pb-4 pt-2 lg:block">
              <p className="text-xs text-navy-400">Signed in as</p>
              <p className="truncate font-semibold">{user ? `${user.firstName} ${user.lastName}` : " "}</p>
              <p className="truncate text-xs text-navy-400">{user?.email ?? " "}</p>
            </div>
            <nav aria-label="Account" className="no-scrollbar flex gap-1 overflow-x-auto lg:mt-2 lg:flex-col lg:overflow-visible">
              {LINKS.map(({ href, label, icon: Icon }) => {
                const active = href === "/account" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                      active ? "bg-navy text-white" : "text-navy hover:bg-offwhite",
                    )}
                  >
                    <Icon className={clsx("size-[1.125rem]", active ? "text-orange" : "text-navy-400")} aria-hidden />
                    {label}
                  </Link>
                );
              })}
              <button type="button" onClick={signOut} className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-navy hover:bg-offwhite lg:mt-1 lg:border-t lg:border-line lg:pt-1">
                <LogOut className="size-[1.125rem] text-navy-400" aria-hidden />
                Sign out
              </button>
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/** Shared states for account pages. */
export function Loading({ label }: { label: string }) {
  return <div className="h-56 animate-pulse rounded-card bg-navy-50" aria-busy="true" aria-label={label} />;
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="card p-6">
      <p className="text-danger">{message}</p>
      <button type="button" onClick={onRetry} className="btn-outline mt-4">Try again</button>
    </div>
  );
}
