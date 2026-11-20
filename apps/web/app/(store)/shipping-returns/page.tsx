import type { Metadata } from "next";
import Link from "next/link";
import { formatNaira } from "@pickova/shared";
import { DraftNotice, PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import type { DeliveryZoneDTO } from "@pickova/shared";

export const metadata: Metadata = {
  title: "Shipping & Returns Policy",
  description: "Delivery fees and timelines for every Nigerian state, plus how returns and exchanges work at Pickova.",
  alternates: { canonical: "/shipping-returns" },
};

export default async function ShippingReturnsPage() {
  // Fees come straight from Delivery Settings, so this page can never drift from checkout.
  const zones = await api<DeliveryZoneDTO[]>("/store/delivery-zones", { revalidate: 60, tags: ["delivery"] });

  return (
    <>
      <PageHeader title="Shipping & Returns" intro="How we get your pair to you — and what to do if it isn't right." />
      <div className="container-page py-12">
        <div className="prose-policy mx-auto max-w-3xl">
          <DraftNotice />

          <h2>Delivery</h2>
          <p>We deliver to all 36 states and the FCT. Orders are processed after payment is confirmed, and you will receive tracking details once your order ships.</p>

          <div className="card not-prose my-6 overflow-hidden">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Delivery fee and estimated time by state</caption>
              <thead className="bg-navy text-white">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">State</th>
                  <th scope="col" className="px-5 py-3 font-medium">Delivery fee</th>
                  <th scope="col" className="px-5 py-3 font-medium">Estimated time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {zones.map((z) => (
                  <tr key={z.state}>
                    <th scope="row" className="px-5 py-2.5 font-medium text-navy">{z.state}</th>
                    <td className="px-5 py-2.5 text-navy-500">{z.feeKobo === 0 ? "Free" : formatNaira(z.feeKobo)}</td>
                    <td className="px-5 py-2.5 text-navy-500">{z.etaMinDays}–{z.etaMaxDays} working days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Returns &amp; exchanges</h2>
          <ul>
            <li>Contact us as soon as possible after delivery if you need a different size or want to return a pair.</li>
            <li>Shoes must be unworn, clean and in their original packaging.</li>
            <li>If we sent the wrong item or it arrived damaged, we will put it right at no cost to you.</li>
            <li>Approved refunds are returned to your original payment method.</li>
          </ul>

          <h2>Need help?</h2>
          <p>
            <Link href="/contact">Contact us</Link> with your order reference and we will sort it out. You can also{" "}
            <Link href="/track-order">track your order</Link> at any time.
          </p>
        </div>
      </div>
    </>
  );
}
