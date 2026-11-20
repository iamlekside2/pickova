import type { Metadata } from "next";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata: Metadata = { title: "Your Wishlist", robots: { index: false } };

export default function WishlistPage() {
  return (
    <div className="container-page pb-4 pt-8 sm:pt-10">
      <h1 className="text-3xl sm:text-4xl">Your Wishlist</h1>
      <WishlistView />
    </div>
  );
}
