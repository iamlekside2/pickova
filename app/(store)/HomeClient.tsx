"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { NEUTRAL_THEME } from "@/lib/theme";
import { NeutralHero } from "@/components/NeutralHero";
import { CategoryTiles, type StoreCategory } from "@/components/CategoryTiles";
import { TrustBar } from "@/components/TrustBar";
import { CatalogSection } from "@/components/CatalogSection";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { Newsletter } from "@/components/Newsletter";

type HomeClientProps = {
  products: Product[];
  categories: StoreCategory[];
  trending: Product[];
  lowestPrice: number;
};

export function HomeClient({
  products,
  categories,
  trending,
  lowestPrice,
}: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const pickCategory = (category: Category) => {
    setActiveCategory(category);
    if (typeof document !== "undefined") {
      document.getElementById("picks")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categoryNames = categories.map((c) => c.name);

  return (
    <>
      <NeutralHero lowestPrice={lowestPrice} />

      <TrustBar />

      <CategoryTiles categories={categories} onPick={pickCategory} />

      <section id="picks" className="mx-auto max-w-content px-6 pb-2 pt-10">
        <CatalogSection
          products={products}
          categories={categoryNames}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </section>

      {/* Recently viewed */}
      <RecentlyViewed lookup={products} />

      {/* Trending Now */}
      {trending.length > 0 && (
        <section className="mx-auto max-w-content px-6 pt-12">
          <div className="mb-4 flex items-center gap-2">
            <Flame size={24} className="text-brand-gold" />
            <h2 className="m-0 font-display text-[28px] font-extrabold text-brand-green">
              Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} season={NEUTRAL_THEME} />
            ))}
          </div>
        </section>
      )}

      <Newsletter />

      <div className="h-6" />
    </>
  );
}
