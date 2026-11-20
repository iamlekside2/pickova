import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page pb-4 pt-8 sm:pt-10">
      <h1 className="text-3xl sm:text-4xl">Your Cart</h1>
      <CartView />
    </div>
  );
}
