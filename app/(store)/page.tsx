import { STORE } from "@/data/store";
import { Hero } from "@/components/home/Hero";
import { Benefits, CategoryTiles, FeaturedCollections, ProductRail, PromoBanner, WhatsAppCta } from "@/components/home/Sections";
import { getCategories, getProducts } from "@/lib/catalog";

export default function HomePage() {
  const newArrivals = getProducts({ newArrival: true, pageSize: 4 });
  const bestSellers = getProducts({ bestSeller: true, sort: "popular", pageSize: 4 });

  return (
    <>
      <Hero />
      <div className="relative z-10 -mt-2 space-y-16 sm:space-y-20">
        <Benefits />
        <CategoryTiles categories={getCategories().filter((c) => c.productCount > 0)} />
        <ProductRail
          id="new-arrivals"
          title="New Arrivals"
          subtitle="Fresh pairs, just landed."
          href="/new-arrivals"
          linkLabel="View all new arrivals"
          products={newArrivals.items}
          priority
        />
        <PromoBanner banner={STORE.promo} />
        <ProductRail
          id="best-sellers"
          title="Best Sellers"
          subtitle="The pairs everyone keeps picking."
          href="/shop?sort=popular"
          linkLabel="View all products"
          products={bestSellers.items}
        />
        <FeaturedCollections />
        <WhatsAppCta />
      </div>
    </>
  );
}
