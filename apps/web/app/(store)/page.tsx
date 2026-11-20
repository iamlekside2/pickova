import { Hero } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { Benefits, CategoryTiles, CustomerReviews, FeaturedCollections, ProductRail, PromoBanner } from "@/components/home/Sections";
import { getBanners, getCategories, getFeaturedReviews, getProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [newArrivals, bestSellers, categories, banners, reviews] = await Promise.all([
    getProducts({ newArrival: true, pageSize: 4 }),
    getProducts({ bestSeller: true, sort: "popular", pageSize: 4 }),
    getCategories(),
    getBanners(),
    getFeaturedReviews(),
  ]);

  return (
    <>
      <Hero />
      <div className="relative z-10 -mt-2 space-y-16 sm:space-y-20">
        <Benefits />
        <CategoryTiles categories={categories} />
        <ProductRail
          id="new-arrivals"
          title="New Arrivals"
          subtitle="Fresh pairs, just landed."
          href="/new-arrivals"
          linkLabel="View all new arrivals"
          products={newArrivals.items}
          priority
        />
        <PromoBanner banner={banners.find((b) => b.placement === "PROMO")} />
        <ProductRail
          id="best-sellers"
          title="Best Sellers"
          subtitle="The pairs everyone keeps picking."
          href="/shop?sort=popular"
          linkLabel="View all products"
          products={bestSellers.items}
        />
        <FeaturedCollections />
        <CustomerReviews reviews={reviews} />
        <Newsletter />
      </div>
    </>
  );
}
