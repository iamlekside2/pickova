import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueView, type CatalogueSearchParams } from "@/components/shop/CatalogueView";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default function SearchPage({ searchParams }: { searchParams: CatalogueSearchParams }) {
  const raw = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const q = (raw ?? "").trim().slice(0, 80);

  if (!q) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-3xl">Search Pickova</h1>
        <p className="mx-auto mt-3 max-w-md text-navy-400">Use the search box above to find a pair by name, style or colour.</p>
        <Link href="/shop" className="btn-primary mt-8">Browse all products</Link>
      </div>
    );
  }

  return (
    <CatalogueView
      title={`Results for “${q}”`}
      basePath={`/search`}
      searchParams={searchParams}
      fixed={{ q }}
    />
  );
}
