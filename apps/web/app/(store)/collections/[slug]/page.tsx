import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueView, type CatalogueSearchParams } from "@/components/shop/CatalogueView";
import { getCategories } from "@/lib/catalog";
import { COLLECTION_COPY } from "@/lib/nav";

type Props = { params: { slug: string }; searchParams: CatalogueSearchParams };

async function findCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await findCategory(params.slug);
  if (!category) return {};
  const copy = COLLECTION_COPY[category.slug];
  return {
    title: copy?.title ?? category.name,
    description: copy?.blurb ?? category.description,
    alternates: { canonical: `/collections/${category.slug}` },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const category = await findCategory(params.slug);
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
