import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductCard";
import { getFacets, getProducts, type ProductListParams } from "@/lib/catalog";
import { Filters } from "./Filters";

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

type Props = {
  title: string;
  description?: string;
  basePath: string;
  searchParams: CatalogueSearchParams;
  /** Constraints set by the page itself; visitors cannot filter them away. */
  fixed?: Pick<ProductListParams, "newArrival" | "q"> & { category?: string };
  breadcrumb?: { label: string; href: string }[];
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const int = (v: string | undefined) => (v && /^\d{1,9}$/.test(v) ? parseInt(v, 10) : undefined);

/** Shared body of Shop All, the collections, New Arrivals and Search. */
export function CatalogueView({ title, description, basePath, searchParams, fixed = {}, breadcrumb = [] }: Props) {
  const sp = searchParams;
  const categories = [fixed.category, one(sp.category)].filter(Boolean).join(",");

  const query: ProductListParams = {
    q: fixed.q,
    category: categories || undefined,
    size: one(sp.size),
    colour: one(sp.colour),
    minPrice: int(one(sp.minPrice)),
    maxPrice: int(one(sp.maxPrice)),
    inStock: one(sp.inStock) === "1",
    onSale: one(sp.onSale) === "1",
    newArrival: fixed.newArrival,
    sort: one(sp.sort),
    page: Math.min(int(one(sp.page)) ?? 1, 500) || 1,
    pageSize: 12,
  };

  const facets = getFacets();
  const result = getProducts(query);

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const value = one(v);
      if (value && k !== "page") next.set(k, value);
    }
    if (page > 1) next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="container-page pb-4 pt-8 sm:pt-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-navy-400">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="rounded hover:text-orange-700">Home</Link></li>
          {breadcrumb.map((b) => (
            <li key={b.href} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href={b.href} className="rounded hover:text-orange-700">{b.label}</Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5 font-medium text-navy" aria-current="page">
            <ChevronRight className="size-3.5" aria-hidden />
            {title}
          </li>
        </ol>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 leading-relaxed text-navy-400">{description}</p>}
      </header>

      <div className="grid gap-x-8 lg:grid-cols-[17rem_1fr]">
        <Filters facets={facets} lockedCategory={fixed.category} total={result.total} />

        <div className="lg:col-start-2">
          {result.items.length > 0 ? (
            <div className="lg:[&>ul]:grid-cols-3">
              <ProductGrid products={result.items} priorityCount={3} />
            </div>
          ) : (
            <div className="card grid place-items-center px-6 py-16 text-center">
              <SearchX className="size-10 text-navy-200" aria-hidden />
              <h2 className="mt-4 text-xl">No pairs match those filters</h2>
              <p className="mt-2 max-w-sm text-sm text-navy-400">Try removing a filter or two, or browse the full collection.</p>
              <Link href={fixed.q ? "/shop" : basePath} className="btn-navy mt-6">
                {fixed.q ? "Browse all products" : "Clear filters"}
              </Link>
            </div>
          )}

          {result.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
              {result.page > 1 ? (
                <Link href={pageHref(result.page - 1)} className="btn-outline min-h-10 px-4" rel="prev">
                  <ChevronLeft className="size-4" aria-hidden /> Previous
                </Link>
              ) : (
                <span className="btn-outline min-h-10 px-4 opacity-40" aria-disabled="true">
                  <ChevronLeft className="size-4" aria-hidden /> Previous
                </span>
              )}
              <p className="text-sm text-navy-400">
                Page <span className="font-semibold text-navy">{result.page}</span> of {result.totalPages}
              </p>
              {result.page < result.totalPages ? (
                <Link href={pageHref(result.page + 1)} className="btn-outline min-h-10 px-4" rel="next">
                  Next <ChevronRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <span className="btn-outline min-h-10 px-4 opacity-40" aria-disabled="true">
                  Next <ChevronRight className="size-4" aria-hidden />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
