import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { STORE } from "@/data/store";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { FOOTER_NAV } from "@/lib/nav";
import { hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";

const SOCIAL_LABELS = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook", x: "X" } as const;

export function Footer() {
  const { contact, social } = STORE;
  // Only channels that have been filled in are shown.
  const socials = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => social[k]);

  return (
    <footer className="mt-20 bg-navy text-white">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo tone="white" tagline size="md" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
            Everyday sneakers and casual shoes. Real product photos, honest prices and fast delivery across Nigeria.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-white/80">
            {hasWhatsApp && (
              <li>
                <a href={whatsappUrl("Hello Pickova! I have a question.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded hover:text-orange-300">
                  <WhatsAppIcon className="size-4 text-orange" /> Chat on WhatsApp
                </a>
              </li>
            )}
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2.5 rounded hover:text-orange-300">
                  <Phone className="size-4 text-orange" aria-hidden /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2.5 rounded hover:text-orange-300">
                  <Mail className="size-4 text-orange" aria-hidden /> {contact.email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden /> {contact.address}
              </li>
            )}
          </ul>
        </div>

        {FOOTER_NAV.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{group.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="rounded hover:text-orange-300">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Pickova. All rights reserved.</p>
          {socials.length > 0 && (
            <ul className="flex items-center gap-4" aria-label="Social media">
              {socials.map((key) => (
                <li key={key}>
                  <a href={social[key]} target="_blank" rel="noopener noreferrer" className="rounded font-medium text-white/80 hover:text-orange-300">
                    {SOCIAL_LABELS[key]}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="inline-flex items-center gap-2">
            <WhatsAppIcon className="size-3.5 text-orange" />
            Orders are placed and confirmed on WhatsApp
          </p>
        </div>
      </div>
    </footer>
  );
}
