import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Star, Truck, ShieldCheck } from "lucide-react";
import { NEUTRAL_THEME } from "@/lib/theme";
import { getCatalog, getStoreProductById } from "@/lib/store";
import { naira, normalizeRating } from "@/lib/format";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCard } from "@/components/ProductCard";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { AddToBasketButton } from "./AddToBasketButton";

type Params = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getStoreProductById(params.id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.name} — ${naira(product.price)}. A Pickova ${product.category} pick.`,
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getStoreProductById(params.id);
  if (!product) notFound();

  const rating = normalizeRating(product.rating);

  const catalog = await getCatalog();
  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-brand-muted">
        <Link href="/" className="hover:text-brand-green">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/#picks" className="hover:text-brand-green">
          {product.category}
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-card">
          <div className="aspect-square w-full">
            <ImagePlaceholder
              from={NEUTRAL_THEME.themeFrom}
              to={NEUTRAL_THEME.themeTo}
              src={product.image}
              category={product.category}
              label={product.name}
              iconSize={40}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold text-brand-green">
              {product.category}
            </span>
          </div>

          <h1 className="m-0 mb-3 font-display text-3xl font-extrabold text-brand-ink">
            {product.name}
          </h1>

          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(rating)
                      ? "fill-brand-gold text-brand-gold"
                      : "text-brand-line-2"
                  }
                />
              ))}
            </div>
            <span className="text-sm font-medium text-brand-muted">
              {rating.toFixed(1)} · In stock
            </span>
          </div>

          <div className="mb-5 font-display text-4xl font-extrabold text-brand-gold">
            {naira(product.price)}
          </div>

          <p className="mb-6 max-w-prose text-[15px] leading-relaxed text-brand-muted">
            A curated {product.category} pick from Pickova. Sourced through our supply
            partners and shipped straight to your door across Nigeria. Pay securely with
            Paystack — card, bank transfer, or USSD — or order straight from WhatsApp.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <AddToBasketButton product={product} />
            <WhatsAppButton product={product} className="flex-1 sm:flex-none" />
          </div>

          {/* Trust points */}
          <div className="mt-6 flex flex-col gap-2.5 border-t border-brand-line pt-5 text-sm text-brand-muted">
            <span className="flex items-center gap-2">
              <Truck size={18} className="text-brand-green" /> Fast delivery nationwide
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-green" /> Secure Paystack checkout
            </span>
          </div>
        </div>
      </div>

      {/* Related — same category */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-2xl font-extrabold text-brand-green">
            More {product.category} Picks
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} season={NEUTRAL_THEME} />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed — records this product and shows the shopper's history */}
      <RecentlyViewed currentId={product.id} lookup={catalog} />
    </div>
  );
}
