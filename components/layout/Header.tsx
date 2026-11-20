"use client";

import clsx from "clsx";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { MAIN_NAV } from "@/lib/nav";
import { hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";
import { cartCount, useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function SearchForm({ className, onDone, autoFocus }: { className?: string; onDone?: () => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setTerm("");
    onDone?.();
  }
  return (
    <form role="search" onSubmit={submit} className={clsx("relative", className)}>
      <label htmlFor={autoFocus ? "search-mobile" : "search-desktop"} className="sr-only">
        Search for sneakers
      </label>
      <input
        id={autoFocus ? "search-mobile" : "search-desktop"}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search for sneakers…"
        autoFocus={autoFocus}
        maxLength={80}
        className="h-11 w-full rounded-full border border-navy-100 bg-white pl-5 pr-12 text-sm text-navy shadow-sm placeholder:text-navy-300 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
      />
      <button type="submit" aria-label="Search" className="absolute right-1 top-1 grid size-9 place-items-center rounded-full text-navy hover:bg-navy-50">
        <Search className="size-5" aria-hidden />
      </button>
    </form>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-orange px-1 text-[0.6875rem] font-semibold leading-5 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);

  const cartLines = useCart((s) => s.lines);
  const cartReady = useCart((s) => s.hydrated);
  const wishCount = useWishlist((s) => s.slugs.length);
  const wishReady = useWishlist((s) => s.hydrated);

  // Close every overlay when the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!shopOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShopOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [shopOpen, menuOpen]);

  const iconBtn = "relative grid size-11 place-items-center rounded-full text-navy transition hover:bg-navy-50";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-[4.5rem] items-center gap-3 lg:gap-8">
        <button type="button" className={clsx(iconBtn, "-ml-2 lg:hidden")} onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
          <Menu className="size-6" aria-hidden />
        </button>

        <Logo size="md" className="mr-auto lg:mr-0" />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {MAIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const linkClass = clsx(
              "relative inline-flex h-[4.5rem] items-center gap-1 px-3 text-[0.9375rem] font-medium transition",
              active ? "text-orange-600" : "text-navy hover:text-orange-600",
            );
            const underline = active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-orange" aria-hidden />;
            if (!item.children) {
              return (
                <Link key={item.href} href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
                  {item.label}
                  {underline}
                </Link>
              );
            }
            return (
              <div key={item.href} ref={shopRef} className="relative">
                <button type="button" className={linkClass} aria-expanded={shopOpen} aria-haspopup="true" onClick={() => setShopOpen((v) => !v)}>
                  {item.label}
                  <ChevronDown className={clsx("size-4 transition", shopOpen && "rotate-180")} aria-hidden />
                  {underline}
                </button>
                {shopOpen && (
                  <div className="absolute left-0 top-full w-56 animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-card-hover">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy hover:bg-offwhite hover:text-orange-600">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <SearchForm className="ml-auto hidden w-full max-w-xs md:max-lg:block xl:block" />

        <div className="flex items-center lg:max-xl:ml-auto">
          {/* The full search box needs room: below md and between lg–xl (where the nav is showing) it collapses to an icon. */}
          <button type="button" className={clsx(iconBtn, "md:max-lg:hidden xl:hidden")} onClick={() => setSearchOpen((v) => !v)} aria-label="Search" aria-expanded={searchOpen}>
            {searchOpen ? <X className="size-6" aria-hidden /> : <Search className="size-6" aria-hidden />}
          </button>
          <Link href="/wishlist" className={clsx(iconBtn, "hidden sm:grid")} aria-label={`Wishlist${wishReady && wishCount ? `, ${wishCount} items` : ""}`}>
            <Heart className="size-6" aria-hidden />
            {wishReady && <CountBadge count={wishCount} />}
          </Link>
          <Link href="/cart" className={iconBtn} aria-label={`Cart${cartReady ? `, ${cartCount(cartLines)} items` : ""}`}>
            <ShoppingCart className="size-6" aria-hidden />
            {cartReady && <CountBadge count={cartCount(cartLines)} />}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-white px-4 py-3 md:max-lg:hidden xl:hidden">
          <SearchForm autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile navigation drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-navy-900/50" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] animate-slide-in flex-col bg-white shadow-card-hover">
            <div className="flex h-[4.5rem] items-center justify-between border-b border-line px-5">
              <Logo size="sm" />
              <button type="button" className={iconBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              {MAIN_NAV.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "block rounded-xl px-4 py-3 text-base font-medium",
                      isActive(pathname, item.href) ? "bg-orange-50 text-orange-700" : "text-navy hover:bg-offwhite",
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="mb-1 ml-4 border-l border-line pl-2">
                      {item.children.slice(1).map((child) => (
                        <Link key={child.href} href={child.href} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy-500 hover:bg-offwhite hover:text-navy">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/contact" className="block rounded-xl px-4 py-3 text-base font-medium text-navy hover:bg-offwhite">
                Contact
              </Link>
            </nav>
            <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
              <Link href="/wishlist" className="btn-outline">
                <Heart className="size-4" aria-hidden /> Wishlist
              </Link>
              <Link href="/cart" className="btn-outline">
                <ShoppingCart className="size-4" aria-hidden /> Cart
              </Link>
              {hasWhatsApp && (
                <a href={whatsappUrl("Hello Pickova! I have a question.")} target="_blank" rel="noopener noreferrer" className="btn-navy col-span-2">
                  <WhatsAppIcon className="size-5" /> Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
