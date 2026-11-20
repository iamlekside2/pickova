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
          <p>An order is confirmed once your payment has been verified. We will email you an order reference that you can use to track your delivery.</p>

          <h2>Prices and payment</h2>
          <p>All prices are in Nigerian Naira (₦). Delivery fees are shown in your cart before you pay. Payment is made online through Paystack.</p>

          <h2>Availability</h2>
          <p>Stock is confirmed at checkout. If an item becomes unavailable after you have paid, we will contact you and refund you in full.</p>

          <h2>Delivery, returns and refunds</h2>
          <p>These are covered in our <Link href="/shipping-returns">Shipping &amp; Returns Policy</Link>.</p>

          <h2>Your account</h2>
          <p>You are responsible for keeping your password confidential and for activity that happens under your account.</p>

          <h2>Product information</h2>
          <p>We work hard to show our products accurately. Colours can look slightly different from screen to screen.</p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

          <h2>Contact</h2>
          <p>Questions about these terms? <Link href="/contact">Contact us</Link>.</p>
        </div>
      </div>
    </>
  );
}
