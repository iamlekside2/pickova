import { Mail, MapPin, MessageCircle, PackageSearch, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getSettings } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Pickova about an order, sizing, delivery or returns.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { contact } = await getSettings();
  const whatsapp = contact.whatsapp?.replace(/\D/g, "");

  const channels = [
    contact.phone && { icon: Phone, title: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    whatsapp && { icon: MessageCircle, title: "WhatsApp", value: "Chat with us", href: `https://wa.me/${whatsapp}` },
    contact.email && { icon: Mail, title: "Email", value: contact.email, href: `mailto:${contact.email}` },
  ].filter(Boolean) as { icon: typeof Phone; title: string; value: string; href: string }[];

  return (
    <>
      <PageHeader title="Contact Us" intro="Questions about an order, sizing, delivery or a return? We're happy to help." />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          {channels.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2">
              {channels.map(({ icon: Icon, title, value, href }) => (
                <li key={title}>
                  <a href={href} className="card flex h-full items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-card-hover" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
                      <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm text-navy-400">{title}</span>
                      <span className="block font-semibold">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            // Shown until the owner adds contact details in Store Settings.
            <p className="card p-6 text-navy-500">Our contact details are being set up and will appear here shortly.</p>
          )}

          {contact.address && (
            <p className="card mt-5 flex items-start gap-4 p-6">
              <MapPin className="mt-0.5 size-6 shrink-0 text-orange" aria-hidden />
              <span>{contact.address}</span>
            </p>
          )}

          <div className="card mt-5 flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <PackageSearch className="size-6 shrink-0 text-orange" aria-hidden />
              <p>
                <span className="block font-semibold">Looking for your order?</span>
                <span className="block text-sm text-navy-400">Track it with your reference and email.</span>
              </p>
            </div>
            <Link href="/track-order" className="btn-navy">Track Order</Link>
          </div>
          <p className="mt-6 text-center text-sm text-navy-400">
            Many answers are already in our <Link href="/faq" className="rounded font-medium text-orange-700 underline underline-offset-2">FAQs</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
