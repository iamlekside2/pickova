import clsx from "clsx";
import { ArrowRight, Camera, Headset, MessageCircle, RotateCcw, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryDTO, ProductSummaryDTO } from "@/lib/shared";
import { ProductGrid } from "@/components/product/ProductCard";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";

/* ── D. Shopping benefits ─────────────────────────────────────────────── */

const BENEFITS = [
  { icon: MessageCircle, title: "Easy Ordering", text: "Order in a WhatsApp chat" },
  { icon: Truck, title: "Fast Delivery", text: "To every state in Nigeria" },
  { icon: Camera, title: "Real Product Photos", text: "What you see is what you get" },
  { icon: RotateCcw, title: "Easy Returns", text: "Wrong size? We'll sort it" },
  { icon: Headset, title: "Customer Support", text: "Real people, ready to help" },
];

export function Benefits() {
  return (
    <section aria-label="Why shop with Pickova" className="container-page">
      <ul className="card grid grid-cols-2 gap-x-4 gap-y-6 px-5 py-6 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-line lg:px-2">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 last:col-span-2 sm:last:col-span-1 lg:justify-center lg:px-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
              <Icon className="size-[1.375rem]" strokeWidth={1.75} aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-navy">{title}</span>
              <span className="block text-xs text-navy-400">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Section heading ──────────────────────────────────────────────────── */

export function SectionHeading({ title, subtitle, href, linkLabel, id }: { title: string; subtitle?: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2 id={id} className="flex items-center gap-3 text-2xl sm:text-[2rem]">
          <span className="h-1 w-10 shrink-0 rounded-full bg-orange" aria-hidden />
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-navy-400">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 rounded text-sm font-semibold text-navy hover:text-orange-700">
          {linkLabel ?? "View all"}
          <ArrowRight className="size-4 text-orange transition group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/* ── E. Shop by category ──────────────────────────────────────────────── */

/** Cover photo per category (files in public/products). */
const CATEGORY_PHOTOS: Record<string, string> = {
  men: "/products/air-jordan-1-low-grey-lifestyle.jpg",
  women: "/products/new-balance-x90-pink-1.jpg",
  kids: "/products/vans-old-skool-kids-1.jpg",
  sports: "/products/adidas-ultraboost-red-1.jpg",
  casual: "/products/converse-chuck-taylor-khaki-1.jpg",
};

export function CategoryTiles({ categories }: { categories: CategoryDTO[] }) {
  if (categories.length === 0) return null;
  return (
    <section aria-labelledby="categories-heading" id="collections" className="container-page scroll-mt-28">
      <SectionHeading id="categories-heading" title="Shop by Category" subtitle="Find the right pair for everyone, and every plan." />
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => {
          const photo = c.imageUrl ?? CATEGORY_PHOTOS[c.slug];
          return (
            <li key={c.id} className={clsx(i === categories.length - 1 && categories.length % 2 === 1 && "col-span-2 sm:col-span-1")}>
              <Link
                href={`/collections/${c.slug}`}
                className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card bg-navy p-5 text-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover max-sm:aspect-[5/4]"
              >
                {photo && (
                  <Image
                    src={photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="-z-20 object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                {/* navy scrim keeps the label readable on any photo */}
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent" aria-hidden />
                <span className="text-lg font-bold">{c.name}</span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-orange-300">
                  Shop now <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── F / G. Product rails ─────────────────────────────────────────────── */

export function ProductRail({ id, title, subtitle, href, linkLabel, products, priority }: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  products: ProductSummaryDTO[];
  priority?: boolean;
}) {
  // An empty rail is hidden rather than padded with filler.
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className="container-page">
      <SectionHeading id={id} title={title} subtitle={subtitle} href={href} linkLabel={linkLabel} />
      <ProductGrid products={products} priorityCount={priority ? 4 : 0} />
    </section>
  );
}

/* ── H. Promotional banner ────────────────────────────────────────────── */

export function PromoBanner({ banner }: { banner: { title: string; subtitle: string; ctaLabel: string; ctaHref: string } | null }) {
  if (!banner) return null;
  return (
    <section aria-label="Promotion" className="container-page">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-navy px-6 py-10 text-white sm:px-12 sm:py-14">
        <div className="absolute -right-24 -top-24 -z-10 size-[26rem] rounded-full bg-orange" aria-hidden />
        <div className="absolute -bottom-32 right-40 -z-10 size-72 rounded-full bg-orange/30 blur-3xl" aria-hidden />
        <Image
          src="/brand/promo-sneaker.webp"
          alt=""
          width={900}
          height={830}
          sizes="(min-width: 1024px) 24rem, 20rem"
          className="absolute -bottom-10 right-2 -z-10 hidden h-auto w-[19rem] drop-shadow-2xl md:block lg:right-14 lg:w-[23rem]"
        />
        <div className="max-w-lg">
          <p className="eyebrow !text-orange-300">Just landed</p>
          <h2 className="mt-3 text-3xl text-white sm:text-4xl">{banner.title}</h2>
          {banner.subtitle && <p className="mt-3 leading-relaxed text-white/80">{banner.subtitle}</p>}
          {banner.ctaHref && banner.ctaLabel && (
            <Link href={banner.ctaHref} className="btn-primary mt-7 h-12 px-7">
              {banner.ctaLabel} <ArrowRight className="size-5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── I. Featured collections ──────────────────────────────────────────── */

const COLLECTIONS = [
  {
    href: "/collections/sports",
    eyebrow: "Sports Sneakers",
    title: "Built to move",
    text: "Light, cushioned pairs for training, running and match day.",
    photo: "/products/adidas-alphabounce-blue-1.jpg",
  },
  {
    href: "/collections/casual",
    eyebrow: "Casual Shoes",
    title: "Easy, every day",
    text: "Clean classics for work, outings and lazy weekends.",
    photo: "/products/adidas-samba-red-lifestyle.jpg",
  },
];

export function FeaturedCollections() {
  return (
    <section aria-labelledby="featured-collections" className="container-page">
      <SectionHeading id="featured-collections" title="Featured Collections" subtitle="Two ways to pick your pair." />
      <div className="grid gap-5 md:grid-cols-2">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-navy p-7 text-white shadow-card transition duration-300 hover:shadow-card-hover sm:p-10"
          >
            <Image src={c.photo} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-20 object-cover transition duration-500 group-hover:scale-105" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/90 via-navy-900/55 to-navy-900/10" aria-hidden />
            <span className="eyebrow !text-orange-300">{c.eyebrow}</span>
            <span className="mt-2 block text-3xl font-bold">{c.title}</span>
            <span className="mt-2 block max-w-[16rem] text-sm leading-relaxed text-white/80">{c.text}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-300">
              Explore <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── WhatsApp call to action ──────────────────────────────────────────── */

export function WhatsAppCta() {
  if (!hasWhatsApp) return null;
  return (
    <section aria-labelledby="whatsapp-heading" className="container-page">
      <div className="relative isolate grid items-center gap-6 overflow-hidden rounded-[1.75rem] bg-navy px-6 py-9 text-white sm:px-10 md:grid-cols-[1fr_auto]">
        <div className="absolute -bottom-28 -right-20 -z-10 size-72 rounded-full bg-orange" aria-hidden />
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-orange text-white shadow-glow">
            <WhatsAppIcon className="size-8" />
          </span>
          <div>
            <h2 id="whatsapp-heading" className="text-2xl text-white">Order on WhatsApp</h2>
            <p className="mt-1 text-sm text-white/75">Pick your pair, send us the order, and we&apos;ll confirm and deliver. Questions? Just ask.</p>
          </div>
        </div>
        <a href={whatsappUrl("Hello Pickova! I have a question.")} target="_blank" rel="noopener noreferrer" className="btn h-12 bg-white px-7 text-base text-navy hover:bg-offwhite">
          <WhatsAppIcon className="size-5 text-[#1FAF5A]" /> Chat with us
        </a>
      </div>
    </section>
  );
}
