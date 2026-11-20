import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you shop with Pickova.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms & Conditions" intro="The terms that apply when you use this website and shop with Pickova." />
      <div className="container-page py-12">
        <div className="prose-policy mx-auto max-w-3xl">
          <DraftNotice />

          <h2>Orders</h2>
          <p>Orders are placed by sending us a message on WhatsApp. An order is confirmed only when we reply to confirm availability, the total and the delivery fee, and your payment has been received.</p>

          <h2>Prices and payment</h2>
          <p>All prices are in Nigerian Naira (₦). The delivery fee shown on the website is an estimate; the exact fee is confirmed in the chat before you pay.</p>

          <h2>Availability</h2>
          <p>Sizes shown on the website may sell out before we confirm your order. If an item is unavailable we will tell you in the chat before any payment is made.</p>

          <h2>Delivery and returns</h2>
          <p>These are covered in our <Link href="/shipping-returns">Shipping &amp; Returns Policy</Link>.</p>

          <h2>Product information</h2>
          <p>We work hard to show our products accurately. Colours can look slightly different from screen to screen. Brand names belong to their respective owners.</p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

          <h2>Contact</h2>
          <p>Questions about these terms? <Link href="/contact">Contact us</Link>.</p>
        </div>
      </div>
    </>
  );
}
