import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pickova handles your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" intro="What we collect, why we collect it, and the choices you have." />
      <div className="container-page py-12">
        <div className="prose-policy mx-auto max-w-3xl">
          <DraftNotice />

          <h2>What this website stores</h2>
          <ul>
            <li>This website has no accounts and does not keep a database of customers.</li>
            <li><strong>On your own device only:</strong> your cart, your wishlist and the delivery details you type are saved in your browser so they are still there next time. They are not sent to us until you choose to send an order.</li>
          </ul>

          <h2>When you order</h2>
          <p>
            When you tap “Order on WhatsApp”, your order and delivery details (name, phone number and address) are placed in a WhatsApp
            message that you send to us yourself. From then on they are handled in WhatsApp, which is operated by Meta under its own privacy policy.
          </p>

          <h2>How we use your details</h2>
          <ul>
            <li>To confirm, deliver and support your order.</li>
            <li>We share only what is needed with our delivery partners. We do not sell your personal information.</li>
          </ul>

          <h2>Your rights</h2>
          <p>Under the Nigeria Data Protection Act 2023 you may ask to see, correct or delete the personal information we hold about you.</p>

          <h2>Contact</h2>
          <p>For any privacy question or request, please <Link href="/contact">contact us</Link>.</p>
        </div>
      </div>
    </>
  );
}
