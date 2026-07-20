"use client";

import { resolveIcon } from "@/lib/icons";
import type { Category } from "@/lib/types";

export type StoreCategory = { name: string; icon: string; blurb: string };

type CategoryTilesProps = {
  categories: StoreCategory[];
  onPick: (category: Category) => void;
};

export function CategoryTiles({ categories, onPick }: CategoryTilesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-content px-6 pt-10">
      <h2 className="mb-4 font-display text-[22px] font-extrabold text-brand-green">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ name, icon, blurb }) => {
          const Icon = resolveIcon(icon);
          return (
            <button
              key={name}
              type="button"
              onClick={() => onPick(name as Category)}
              className="group flex flex-col items-start gap-2 rounded-card border border-brand-line-2 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-green hover:shadow-[0_10px_24px_rgba(10,61,38,0.10)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-bg text-brand-green transition-colors group-hover:bg-brand-green group-hover:text-white">
                <Icon size={20} />
              </span>
              <span className="text-sm font-bold text-brand-ink">{name}</span>
              <span className="text-xs text-brand-muted">{blurb}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
