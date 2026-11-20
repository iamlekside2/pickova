import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackOrderForm } from "@/components/orders/TrackOrderForm";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Follow your Pickova delivery with your order reference and email address.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader title="Track Your Order" intro="Enter your order reference and the email you used at checkout to see where your pair is." />
      <div className="container-page py-10">
        <TrackOrderForm />
      </div>
    </>
  );
}
