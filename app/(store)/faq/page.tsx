import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about ordering on WhatsApp, sizes, payment, delivery and returns at Pickova.",
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string }[] = [
  { q: "How do I place an order?", a: "Choose your pair, pick your colour and size, and add it to your cart. In your cart, fill in your delivery details and tap “Order on WhatsApp”. WhatsApp opens with your order already written — just press send." },
  { q: "Do I need WhatsApp to order?", a: "Yes. Orders are sent to us as a WhatsApp message, and we reply in the same chat to confirm everything." },
  { q: "How do I pay?", a: "We confirm that your size is available and send payment details in the WhatsApp chat. You only pay after we have confirmed your order." },
  { q: "How do I know my size?", a: "Sizes are listed in EU sizing. If you are between sizes, we generally suggest going one size up — or ask us in the chat. Sizes that are sold out cannot be selected." },
  { q: "Do you deliver nationwide?", a: "Yes. We deliver to all 36 states and the FCT. Your cart shows an estimated delivery fee for your state, and we confirm the exact fee in the chat." },
  { q: "How long does delivery take?", a: "It depends on your state. Your cart shows an estimate once you choose where we are delivering to." },
  { q: "Are the photos of the actual shoes?", a: "Yes. Pickova uses real product photos, so what you see is what you get." },
  { q: "Can I return or exchange a pair?", a: "Yes, if it is unworn and in its original packaging. See our Shipping & Returns page for how it works." },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader title="Frequently Asked Questions" intro="Quick answers about ordering, payment, delivery and returns." />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <DraftNotice />
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card group px-6 py-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded font-semibold">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-orange transition group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-5 leading-relaxed text-navy-500">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-navy-400">
            Still stuck? <Link href="/contact" className="rounded font-medium text-orange-700 underline underline-offset-2">Contact us</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
