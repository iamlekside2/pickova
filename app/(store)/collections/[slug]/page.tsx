import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueView, type CatalogueSearchParams } from "@/components/shop/CatalogueView";
import { getCategories } from "@/lib/catalog";
import { COLLECTION_COPY } from "@/lib/nav";

type Props = { params: { slug: string }; searchParams: CatalogueSearchParams };

function findCategory(slug: string) {
  return getCategories().find((c) => c.slug === slug);
}

export function generateMetadata({ params }: Props): Metadata {
  const category = findCategory(params.slug);
  if (!category) return {};
  const copy = COLLECTION_COPY[category.slug];
  return {
    title: copy?.title ?? category.name,
    description: copy?.blurb ?? category.description,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

export default function CollectionPage({ params, searchParams }: Props) {
  const category = findCategory(params.slug);
  if (!category) notFound();
  const copy = COLLECTION_COPY[category.slug];
  return (
    <CatalogueView
      title={copy?.title ?? category.name}
      description={copy?.blurb ?? category.description}
      basePath={`/collections/${category.slug}`}
      searchParams={searchParams}
      fixed={{ category: category.slug }}
      breadcrumb={[{ label: "Shop", href: "/shop" }]}
    />
  );
}
