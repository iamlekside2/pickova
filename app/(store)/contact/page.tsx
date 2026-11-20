import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/data/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Chat with Pickova on WhatsApp about an order, sizing, delivery or returns.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = STORE;
  const channels = [
    hasWhatsApp && { icon: WhatsAppIcon, title: "WhatsApp", value: "Chat with us — the quickest way to reach us", href: whatsappUrl("Hello Pickova! I have a question.") },
    contact.phone && { icon: Phone, title: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    contact.email && { icon: Mail, title: "Email", value: contact.email, href: `mailto:${contact.email}` },
  ].filter(Boolean) as { icon: typeof Phone | typeof WhatsAppIcon; title: string; value: string; href: string }[];

  return (
    <>
      <PageHeader title="Contact Us" intro="Questions about a pair, sizing, delivery or a return? We're happy to help." />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <ul className="grid gap-5 sm:grid-cols-2">
            {channels.map(({ icon: Icon, title, value, href }) => (
              <li key={title} className={channels.length === 1 ? "sm:col-span-2" : undefined}>
                <a href={href} className="card flex h-full items-center gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-card-hover" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-orange-50 text-navy">
                    <Icon className="size-6" />
                  </span>
                  <span>
                    <span className="block text-sm text-navy-400">{title}</span>
                    <span className="block font-semibold">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {contact.address && (
            <p className="card mt-5 flex items-start gap-4 p-6">
              <MapPin className="mt-0.5 size-6 shrink-0 text-orange" aria-hidden />
              <span>{contact.address}</span>
            </p>
          )}

          <p className="mt-6 text-center text-sm text-navy-400">
            Many answers are already in our <Link href="/faq" className="rounded font-medium text-orange-700 underline underline-offset-2">FAQs</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
