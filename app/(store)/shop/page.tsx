import type { Metadata } from "next";
import { CatalogueView, type CatalogueSearchParams } from "@/components/shop/CatalogueView";

export const metadata: Metadata = {
  title: "Shop All Sneakers & Casual Shoes",
  description: "Browse every Pickova pair — sneakers and casual shoes for men, women and kids, delivered across Nigeria.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: { searchParams: CatalogueSearchParams }) {
  return (
    <CatalogueView
      title="Shop All"
      description="Every pair in one place. Filter by size, colour and price to find yours."
      basePath="/shop"
      searchParams={searchParams}
    />
  );
}
