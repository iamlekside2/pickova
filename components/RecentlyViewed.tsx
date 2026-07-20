"use client";

import { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import type { Product } from "@/lib/types";
import { NEUTRAL_THEME } from "@/lib/theme";
import { getRecentlyViewed, recordView } from "@/lib/recentlyViewed";
import { ProductCard } from "@/components/ProductCard";

type RecentlyViewedProps = {
  /** When set, records this product as viewed and excludes it from the rail. */
  currentId?: string;
  title?: string;
  max?: number;
  /** Products to resolve stored ids against (the current catalogue). */
  lookup: Product[];
};

export function RecentlyViewed({
  currentId,
  title = "Recently Viewed",
  max = 4,
  lookup,
}: RecentlyViewedProps) {
  const [items, setItems] = useState<Product[]>([]);
  const byId = useMemo(() => new Map(lookup.map((p) => [p.id, p])), [lookup]);

  useEffect(() => {
    if (currentId) recordView(currentId);

    const refresh = () => {
      const products = getRecentlyViewed()
        .filter((id) => id !== currentId)
        .map((id) => byId.get(id))
        .filter((p): p is Product => Boolean(p))
        .slice(0, max);
      setItems(products);
    };

    refresh();
    window.addEventListener("pickova:recently-viewed", refresh);
    return () => window.removeEventListener("pickova:recently-viewed", refresh);
  }, [currentId, max, byId]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-content px-6 pt-12">
      <div className="mb-4 flex items-center gap-2">
        <History size={24} className="text-brand-green" />
        <h2 className="m-0 font-display text-[28px] font-extrabold text-brand-green">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} season={NEUTRAL_THEME} />
        ))}
      </div>
    </section>
  );
}
