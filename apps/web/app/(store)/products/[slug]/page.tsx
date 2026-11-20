import { ChevronRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { discountPercent } from "@pickova/shared";
import { CustomerReviews, ProductRail } from "@/components/home/Sections";
import { Price, Stars } from "@/components/product/Price";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { getProduct, getProducts } from "@/lib/catalog";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  const description = product.description.slice(0, 155);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, description, type: "website", images: product.image ? [{ url: product.image.url, alt: product.image.alt }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const primaryCategory = product.categories[0];
  const related = primaryCategory
    ? (await getProducts({ category: primaryCategory.slug, pageSize: 5 })).items.filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const discount = discountPercent(product.priceKobo, product.compareAtPriceKobo);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Structured data for search engines. Ratings are included only when real reviews exist.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${siteUrl}${i.url}`)),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: (product.priceKobo / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.rating
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count } }
      : {}),
  };

  return (
    <div className="pb-4 pt-8 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-page">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-navy-400">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="rounded hover:text-orange-700">Home</Link></li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5" aria-hidden />
              <Link href="/shop" className="rounded hover:text-orange-700">Shop</Link>
            </li>
            {primaryCategory && (
              <li className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" aria-hidden />
                <Link href={`/collections/${primaryCategory.slug}`} className="rounded hover:text-orange-700">{primaryCategory.name}</Link>
              </li>
            )}
            <li className="flex items-center gap-1.5 font-medium text-navy" aria-current="page">
              <ChevronRight className="size-3.5" aria-hidden />
              {product.name}
            </li>
          </ol>
        </nav>

        <ProductPurchase product={product}>
          <div className="flex flex-wrap items-center gap-2">
            {product.isNewArrival && <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">New</span>}
            {discount !== null && <span className="rounded-full bg-orange px-3 py-1 text-xs font-semibold text-white">Save {discount}%</span>}
            {!product.inStock && <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy">Sold out</span>}
          </div>
          {product.brand && <p className="eyebrow mt-4">{product.brand}</p>}
          <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>
          {product.rating && <Stars average={product.rating.average} count={product.rating.count} className="mt-3" />}
          <Price priceKobo={product.priceKobo} compareAtKobo={product.compareAtPriceKobo} size="lg" className="mt-4" />
          <p className="mt-5 leading-relaxed text-navy-500">{product.description}</p>
          <p className="mt-3 text-xs text-navy-300">SKU: {product.sku}</p>
        </ProductPurchase>

        <ul className="card mt-12 grid gap-6 p-6 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Fast delivery across Nigeria", text: "Delivery fee is calculated at checkout from your state.", href: "/shipping-returns" },
            { icon: RotateCcw, title: "Easy returns", text: "Wrong size? See how returns and exchanges work.", href: "/shipping-returns" },
            { icon: ShieldCheck, title: "Secure payment", text: "Pay safely by card, transfer or USSD through Paystack.", href: "/faq" },
          ].map(({ icon: Icon, title, text, href }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <Link href={href} className="block rounded text-sm font-semibold text-navy hover:text-orange-700">{title}</Link>
                <span className="mt-0.5 block text-sm text-navy-400">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 space-y-16">
        <CustomerReviews reviews={product.reviews} />
        <ProductRail
          id="related-products"
          title="You may also like"
          subtitle={primaryCategory ? `More from ${primaryCategory.name}.` : "More pairs to pick from."}
          href={primaryCategory ? `/collections/${primaryCategory.slug}` : "/shop"}
          linkLabel="View all"
          products={related}
        />
      </div>
    </div>
  );
}
