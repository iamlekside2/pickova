"use client";

import clsx from "clsx";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { PRODUCT_SORTS, PRODUCT_SORT_LABELS, type ProductFacetsDTO } from "@/lib/shared";

type Props = {
  facets: ProductFacetsDTO;
  /** Category slug fixed by the page (e.g. "men" on the Men's collection). */
  lockedCategory?: string;
  /** Filter keys managed here; anything else in the URL (like ?q=) is preserved. */
  total: number;
};

const MULTI_KEYS = ["category", "size", "colour"] as const;
const FILTER_KEYS = [...MULTI_KEYS, "minPrice", "maxPrice", "inStock", "onSale"];

/** Filters live in the URL, so results are shareable, bookmarkable and server-rendered. */
export function Filters({ facets, lockedCategory, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const list = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);
  const activeCount = FILTER_KEYS.filter((k) => params.get(k)).length;

  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  useEffect(() => {
    setMinPrice(params.get("minPrice") ?? "");
    setMaxPrice(params.get("maxPrice") ?? "");
  }, [params]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function update(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page"); // any filter change returns to page 1
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function toggle(key: string, value: string) {
    update((next) => {
      const values = new Set((next.get(key) ?? "").split(",").filter(Boolean));
      if (values.has(value)) values.delete(value);
      else values.add(value);
      if (values.size) next.set(key, [...values].join(","));
      else next.delete(key);
    });
  }

  function setFlag(key: string, on: boolean) {
    update((next) => (on ? next.set(key, "1") : next.delete(key)));
  }

  function applyPrice(e: FormEvent) {
    e.preventDefault();
    update((next) => {
      const min = parseInt(minPrice, 10);
      const max = parseInt(maxPrice, 10);
      if (min > 0) next.set("minPrice", String(min));
      else next.delete("minPrice");
      if (max > 0) next.set("maxPrice", String(max));
      else next.delete("maxPrice");
    });
  }

  const groupTitle = "mb-3 text-sm font-semibold text-navy";
  const chip = (selected: boolean) =>
    clsx(
      "min-h-10 rounded-full border px-4 text-sm font-medium transition",
      selected ? "border-navy bg-navy text-white" : "border-navy-100 bg-white text-navy hover:border-navy",
    );

  const categories = facets.categories.filter((c) => c.slug !== lockedCategory && c.productCount > 0);

  const body = (
    <div className="space-y-7">
      {categories.length > 0 && (
        <fieldset>
          <legend className={groupTitle}>Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c.id} type="button" aria-pressed={list("category").includes(c.slug)} onClick={() => toggle("category", c.slug)} className={chip(list("category").includes(c.slug))}>
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className={groupTitle}>Size (EU)</legend>
        <div className="grid grid-cols-5 gap-2">
          {facets.sizes.map((s) => {
            const selected = list("size").includes(s.label);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={selected}
                aria-label={`Size ${s.label}`}
                onClick={() => toggle("size", s.label)}
                className={clsx(
                  "min-h-10 rounded-xl border text-sm font-medium transition",
                  selected ? "border-navy bg-navy text-white" : "border-navy-100 bg-white text-navy hover:border-navy",
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>Colour</legend>
        <div className="flex flex-wrap gap-2">
          {facets.colours.map((c) => {
            const selected = list("colour").includes(c.name);
            return (
              <button key={c.id} type="button" aria-pressed={selected} onClick={() => toggle("colour", c.name)} className={clsx(chip(selected), "inline-flex items-center gap-2 pl-2.5")}>
                <span className="size-4 rounded-full border border-navy-100" style={{ backgroundColor: c.hex }} aria-hidden />
                {c.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <form onSubmit={applyPrice}>
        <fieldset>
          <legend className={groupTitle}>Price (₦)</legend>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="min-price">Minimum price in naira</label>
            <input id="min-price" inputMode="numeric" pattern="[0-9]*" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))} className="field-input" />
            <span className="text-navy-300" aria-hidden>–</span>
            <label className="sr-only" htmlFor="max-price">Maximum price in naira</label>
            <input id="max-price" inputMode="numeric" pattern="[0-9]*" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))} className="field-input" />
            <button type="submit" className="btn-navy shrink-0 px-5">Go</button>
          </div>
        </fieldset>
      </form>

      <fieldset className="space-y-3">
        <legend className={groupTitle}>Availability</legend>
        {[
          { key: "inStock", label: "In stock only" },
          { key: "onSale", label: "On sale" },
        ].map(({ key, label }) => (
          <label key={key} className="flex min-h-8 cursor-pointer items-center gap-3 text-sm text-navy">
            <input type="checkbox" checked={params.get(key) === "1"} onChange={(e) => setFlag(key, e.target.checked)} className="size-5 rounded border-navy-200 accent-[#F28C28]" />
            {label}
          </label>
        ))}
      </fieldset>

      {activeCount > 0 && (
        <button type="button" onClick={() => update((next) => FILTER_KEYS.forEach((k) => next.delete(k)))} className="rounded text-sm font-medium text-orange-700 underline underline-offset-2">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Toolbar: result count, mobile filter toggle, sort */}
      <div className={clsx("mb-6 flex flex-wrap items-center justify-between gap-3 lg:col-start-2", pending && "opacity-60")}>
        <p className="text-sm text-navy-400" role="status">
          {total} {total === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen(true)} className="btn-outline min-h-10 px-4 lg:hidden" aria-expanded={open}>
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
          <label htmlFor="sort" className="sr-only">Sort products</label>
          <select
            id="sort"
            value={params.get("sort") ?? "newest"}
            onChange={(e) => update((next) => (e.target.value === "newest" ? next.delete("sort") : next.set("sort", e.target.value)))}
            className="min-h-10 rounded-full border border-navy-100 bg-white px-4 text-sm font-medium text-navy focus:border-orange focus:outline-none"
          >
            {PRODUCT_SORTS.map((s) => (
              <option key={s} value={s}>{PRODUCT_SORT_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside aria-label="Filters" className="hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block">
        <div className="card sticky top-24 p-6">{body}</div>
      </aside>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="absolute inset-0 bg-navy-900/50" aria-label="Close filters" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[1.75rem] bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="grid size-10 place-items-center rounded-full hover:bg-navy-50">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{body}</div>
            <div className="border-t border-line p-4">
              <button type="button" onClick={() => setOpen(false)} className="btn-primary w-full">
                Show {total} {total === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
