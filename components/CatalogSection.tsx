"use client";

import { useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { NEUTRAL_THEME } from "@/lib/theme";
import { ProductCard } from "@/components/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

type CatalogSectionProps = {
  products: Product[];
  categories: string[];
  activeCategory: Category | "All";
  onCategoryChange: (category: Category | "All") => void;
};

export function CatalogSection({
  products,
  categories,
  activeCategory,
  onCategoryChange,
}: CatalogSectionProps) {
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const list =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return sorted;
  }, [products, activeCategory, sort]);

  const chips: (Category | "All")[] = ["All", ...(categories as Category[])];

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-display text-[28px] font-extrabold text-brand-green">
          {activeCategory === "All" ? "Everyday Picks" : `${activeCategory} Picks`}
        </h2>
        <span className="text-sm text-brand-muted">
          {filtered.length} product{filtered.length === 1 ? "" : "s"} ready to ship
        </span>
      </div>

      {/* Controls: category chips + sort */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-brand-muted">
          <Filter size={16} />
          <span className="sr-only">Filter by category</span>
        </div>
        <div className="pk-scroll flex flex-1 gap-2 overflow-x-auto">
          {chips.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-gold text-brand-ink"
                    : "border border-brand-line-2 bg-white text-brand-muted hover:border-brand-gold"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-1.5 text-sm text-brand-muted">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-brand-line-2 bg-white px-2.5 py-2 text-[13px] font-semibold text-brand-ink outline-none focus:border-brand-green"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </label>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} season={NEUTRAL_THEME} />
          ))}
        </div>
      ) : (
        <div className="rounded-card bg-white px-2.5 py-12 text-center text-brand-muted-2">
          No {activeCategory} picks in stock right now — check another category.
        </div>
      )}
    </div>
  );
}
