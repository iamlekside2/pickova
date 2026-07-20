import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCollectionBySlug } from "@/lib/store";
import { naira } from "@/lib/format";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ProductCard } from "@/components/ProductCard";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) return { title: "Season not found" };
  return {
    title: `${collection.name} Picks`,
    description: collection.heroSubtext,
  };
}

export default async function SeasonPage({ params }: { params: Params }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) notFound();

  const theme = { themeFrom: collection.themeFrom, themeTo: collection.themeTo };
  const lowestPrice = collection.products.length
    ? Math.min(...collection.products.map((p) => p.price))
    : 0;

  return (
    <>
      {/* Season hero */}
      <section className="relative h-[360px] w-full overflow-hidden bg-brand-green">
        <div className="absolute inset-0">
          <ImagePlaceholder
            from={collection.themeFrom}
            to={collection.themeTo}
            src={collection.heroImage}
            label={`${collection.name} banner`}
            hero
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(6,38,24,0.92) 0%, rgba(6,38,24,0.68) 40%, rgba(6,38,24,0.15) 70%, rgba(6,38,24,0) 90%)",
          }}
        />
        <div className="relative mx-auto flex h-full max-w-content items-center px-6">
          <div className="max-w-[600px] px-6">
            <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/70">
              <Link href="/" className="hover:text-brand-gold">
                Home
              </Link>
              <ChevronRight size={14} />
              <span className="text-brand-gold">{collection.name}</span>
            </nav>
            <h1 className="m-0 mb-3 font-display text-[clamp(28px,4.5vw,48px)] font-extrabold leading-tight text-white">
              {collection.heroHeadline}
            </h1>
            <p className="m-0 mb-4 max-w-[440px] text-base leading-relaxed text-white/85">
              {collection.heroSubtext}
            </p>
            {lowestPrice > 0 && (
              <span className="text-[15px] font-extrabold text-brand-gold">
                From {naira(lowestPrice)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-content px-6 pb-10 pt-9">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h2 className="m-0 font-display text-[28px] font-extrabold text-brand-green">
            <span aria-hidden="true">{collection.emoji}</span> {collection.name} Picks
          </h2>
          <span className="text-sm text-brand-muted">
            {collection.products.length} product
            {collection.products.length === 1 ? "" : "s"}
          </span>
        </div>

        {collection.products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {collection.products.map((p) => (
              <ProductCard key={p.id} product={p} season={theme} />
            ))}
          </div>
        ) : (
          <div className="rounded-card bg-white px-2.5 py-12 text-center text-brand-muted-2">
            No products in this collection yet.
          </div>
        )}
      </section>
    </>
  );
}
