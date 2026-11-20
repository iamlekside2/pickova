import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about ordering, sizes, payment, delivery and returns at Pickova.",
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string }[] = [
  { q: "How do I place an order?", a: "Choose your pair, pick your colour and size, and add it to your cart. At checkout, enter your delivery details and pay securely online." },
  { q: "How do I know my size?", a: "Sizes are listed in EU sizing. If you are between sizes, we generally suggest going one size up. Sizes that are sold out cannot be selected." },
  { q: "Which payment methods do you accept?", a: "Payments are processed by Paystack, which supports debit cards, bank transfer and USSD. We never see or store your card details." },
  { q: "Do you deliver nationwide?", a: "Yes. We deliver to all 36 states and the FCT. The delivery fee depends on your state and is shown in your cart before you pay." },
  { q: "How long does delivery take?", a: "Delivery times depend on your state. You will see an estimate in your cart once you choose where we are delivering to." },
  { q: "Are the photos of the actual shoes?", a: "Yes. Pickova uses real product photos, so what you see is what you get." },
  { q: "Can I return or exchange a pair?", a: "Yes, if it is unworn and in its original packaging. See our Shipping & Returns page for how it works." },
  { q: "How do I track my order?", a: "Use the Track Order page with your order reference and the email address you used at checkout." },
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
