import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pickova collects, uses and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" intro="What we collect, why we collect it, and the choices you have." />
      <div className="container-page py-12">
        <div className="prose-policy mx-auto max-w-3xl">
          <DraftNotice />

          <h2>Information we collect</h2>
          <ul>
            <li><strong>Details you give us:</strong> your name, email address, phone number and delivery address when you create an account or place an order.</li>
            <li><strong>Order information:</strong> what you bought, when, and the status of your delivery.</li>
            <li><strong>Device storage:</strong> your cart and wishlist are saved in your browser so they are still there when you come back. A secure cookie keeps you signed in.</li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To process and deliver your orders, and to keep you updated about them.</li>
            <li>To provide customer support.</li>
            <li>To send you news and offers, only if you have subscribed. You can unsubscribe at any time.</li>
            <li>To prevent fraud and keep the store secure.</li>
          </ul>

          <h2>Payments</h2>
          <p>Payments are processed by Paystack. Your card details go directly to Paystack and are never seen or stored by Pickova.</p>

          <h2>Who we share it with</h2>
          <p>We share only what is needed with the companies that help us serve you: our payment processor and our delivery partners. We do not sell your personal information.</p>

          <h2>Your rights</h2>
          <p>Under the Nigeria Data Protection Act 2023 you may ask to see, correct or delete the personal information we hold about you, and you may withdraw consent to marketing at any time.</p>

          <h2>Contact</h2>
          <p>For any privacy question or request, please <Link href="/contact">contact us</Link>.</p>
        </div>
      </div>
    </>
  );
}
