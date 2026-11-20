import { Camera, ShieldCheck, Tag, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "About Pickova",
  description: "Pickova sells everyday sneakers and casual shoes in Nigeria — real product photos, honest prices and fast delivery.",
  alternates: { canonical: "/about" },
};

const PROMISES = [
  { icon: Camera, title: "Real product photos", text: "What you see is what you get. We show the actual shoe, not a catalogue fantasy." },
  { icon: Tag, title: "Honest, affordable prices", text: "Clear prices in naira with no surprises at checkout." },
  { icon: ShieldCheck, title: "Secure payments", text: "Pay safely before delivery through Paystack." },
  { icon: Truck, title: "Fast delivery", text: "We deliver to your doorstep across Nigeria." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About us" title="Everyday sneakers. Honest prices. Pick your pair." intro="Pickova is a Nigerian online store for stylish everyday sneakers and casual shoes at prices that make sense." />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-navy-500">
          <p>
            Buying shoes online in Nigeria should be simple. You should know exactly what you are getting, what it costs, and when it
            will arrive. That is the whole idea behind Pickova.
          </p>
          <p>
            We choose pairs that work for real life — work, school, outings, the gym and the weekend — and we show them as they are.
            Browse, pay securely, and we deliver to your doorstep.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="card flex gap-4 p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
                <Icon className="size-6" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h2 className="text-lg">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-navy-400">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link href="/shop" className="btn-primary h-12 px-8 text-base">Shop the collection</Link>
        </div>
      </div>
    </>
  );
}
