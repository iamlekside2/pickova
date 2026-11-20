import type { Metadata } from "next";
import { CatalogueView, type CatalogueSearchParams } from "@/components/shop/CatalogueView";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "The newest sneakers and casual shoes at Pickova. Fresh pairs land every week.",
  alternates: { canonical: "/new-arrivals" },
};

export default function NewArrivalsPage({ searchParams }: { searchParams: CatalogueSearchParams }) {
  return (
    <CatalogueView
      title="New Arrivals"
      description="Fresh pairs, just landed. Get yours before your size is gone."
      basePath="/new-arrivals"
      searchParams={searchParams}
      fixed={{ newArrival: true }}
      breadcrumb={[{ label: "Shop", href: "/shop" }]}
    />
  );
}
