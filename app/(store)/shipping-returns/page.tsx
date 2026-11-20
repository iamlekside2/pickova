import type { Metadata } from "next";
import Link from "next/link";
import { DELIVERY_ZONES } from "@/data/delivery";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";
import { formatNaira } from "@/lib/shared";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy",
  description: "Estimated delivery fees and timelines for every Nigerian state, plus how returns and exchanges work at Pickova.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <>
      <PageHeader title="Shipping & Returns" intro="How we get your pair to you — and what to do if it isn't right." />
      <div className="container-page py-12">
        <div className="prose-policy mx-auto max-w-3xl">
          <DraftNotice />

          <h2>Delivery</h2>
          <p>
            We deliver to all 36 states and the FCT. After you send your order on WhatsApp, we confirm availability, the exact delivery
            fee and payment details in the chat, then dispatch your pair. The fees below are estimates.
          </p>

          <div className="card not-prose my-6 overflow-hidden">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Estimated delivery fee and time by state</caption>
              <thead className="bg-navy text-white">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">State</th>
                  <th scope="col" className="px-5 py-3 font-medium">Estimated fee</th>
                  <th scope="col" className="px-5 py-3 font-medium">Estimated time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {DELIVERY_ZONES.map((z) => (
                  <tr key={z.state}>
                    <th scope="row" className="px-5 py-2.5 font-medium text-navy">{z.state}</th>
                    <td className="px-5 py-2.5 text-navy-500">{z.feeNaira === 0 ? "Free" : formatNaira(z.feeNaira * 100)}</td>
                    <td className="px-5 py-2.5 text-navy-500">{z.etaMinDays}–{z.etaMaxDays} working days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Returns &amp; exchanges</h2>
          <ul>
            <li>Message us on WhatsApp as soon as possible after delivery if you need a different size or want to return a pair.</li>
            <li>Shoes must be unworn, clean and in their original packaging.</li>
            <li>If we sent the wrong item or it arrived damaged, we will put it right at no cost to you.</li>
          </ul>

          <h2>Need help?</h2>
          <p>
            <Link href="/contact">Contact us</Link> and we will sort it out.
          </p>
        </div>
      </div>
    </>
  );
}
