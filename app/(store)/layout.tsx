import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { getSearchIndex, getStoreCategories } from "@/lib/store";
import { getCustomer } from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchIndex, categories, customer] = await Promise.all([
    getSearchIndex(),
    getStoreCategories(),
    getCustomer(),
  ]);

  return (
    <CartProvider>
      <Navbar
        searchIndex={searchIndex}
        categories={categories}
        customer={customer ? { name: customer.name } : null}
      />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
