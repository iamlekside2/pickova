"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X, User, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/components/CartProvider";
import { resolveIcon } from "@/lib/icons";
import { naira } from "@/lib/format";

type SearchItem = { id: string; name: string; price: number };
type NavCategory = { name: string; icon: string };

type NavbarProps = {
  searchIndex: SearchItem[];
  categories: NavCategory[];
  customer: { name: string } | null;
};

export function Navbar({ searchIndex, categories, customer }: NavbarProps) {
  const { count, openCart } = useCart();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return searchIndex.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, searchIndex]);

  return (
    <header className="sticky top-0 z-20 flex flex-col bg-white shadow-[0_1px_0_rgba(10,102,64,0.08)]">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Logo />

        {/* Search (desktop) */}
        <div className="relative hidden max-w-md flex-1 md:block">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 rounded-full border border-brand-line-2 bg-brand-bg px-4 py-2.5"
          >
            <Search size={18} className="text-brand-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted-2"
            />
          </form>
          {results.length > 0 && (
            <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-brand-line bg-white py-1 shadow-[0_12px_30px_rgba(10,61,38,0.14)]">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => setQuery("")}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-brand-bg"
                  >
                    <span className="truncate font-medium text-brand-ink">{p.name}</span>
                    <span className="shrink-0 font-bold text-brand-gold">{naira(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href={customer ? "/account" : "/account/login"}
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-bg sm:flex"
          >
            <User size={20} />
            <span className="hidden lg:inline">
              {customer ? customer.name.split(" ")[0] : "Sign in"}
            </span>
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-full bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Basket</span>
            {count > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-gold px-1.5 text-xs font-extrabold text-brand-ink">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-brand-bg md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="border-t border-brand-line px-4 pb-4 pt-3 md:hidden">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="mb-3 flex items-center gap-2 rounded-full border border-brand-line-2 bg-brand-bg px-4 py-2.5"
          >
            <Search size={18} className="text-brand-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted-2"
            />
          </form>
          {results.length > 0 && (
            <ul className="mb-3 overflow-hidden rounded-2xl border border-brand-line">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() => {
                      setQuery("");
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-brand-bg"
                  >
                    <span className="truncate font-medium text-brand-ink">{p.name}</span>
                    <span className="shrink-0 font-bold text-brand-gold">{naira(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ name, icon }) => {
              const Icon = resolveIcon(icon);
              return (
                <Link
                  key={name}
                  href="/#picks"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-1.5 rounded-full bg-brand-bg px-3.5 py-2 text-[13px] font-semibold text-brand-ink"
                >
                  <Icon size={15} /> {name}
                </Link>
              );
            })}
          </div>
          <Link
            href={customer ? "/account" : "/account/login"}
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-green"
          >
            <LogIn size={18} /> {customer ? "My account" : "Sign in / Create account"}
          </Link>
        </div>
      )}
    </header>
  );
}
