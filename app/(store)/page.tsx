import { getCatalog, getStoreCategories } from "@/lib/store";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getCatalog(),
    getStoreCategories(),
  ]);

  const trending = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const lowestPrice = products.length
    ? Math.min(...products.map((p) => p.price))
    : 0;

  return (
    <HomeClient
      products={products}
      categories={categories}
      trending={trending}
      lowestPrice={lowestPrice}
    />
  );
}
