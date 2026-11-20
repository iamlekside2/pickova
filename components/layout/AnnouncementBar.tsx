import { Truck } from "lucide-react";
import Link from "next/link";
import { STORE } from "@/data/store";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { hasWhatsApp, whatsappUrl } from "@/lib/whatsapp";

export function AnnouncementBar() {
  const [first = "Fast delivery across Nigeria", ...rest] = STORE.announcements;
  return (
    <div className="bg-navy-800 text-white">
      <div className="container-page flex min-h-10 items-center justify-between gap-4 text-xs sm:text-[0.8125rem]">
        <p className="flex min-w-0 items-center gap-2 font-medium">
          <Truck className="size-4 shrink-0 text-orange" aria-hidden />
          <span className="truncate">
            {first}
            {rest.map((m) => (
              <span key={m} className="hidden lg:inline">
                <span className="mx-2.5 text-white/30" aria-hidden>|</span>
                {m}
              </span>
            ))}
          </span>
        </p>
        <nav aria-label="Quick links" className="flex shrink-0 items-center gap-3 font-medium sm:gap-4">
          {hasWhatsApp && (
            <a href={whatsappUrl("Hello Pickova! I have a question.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded hover:text-orange-300">
              <WhatsAppIcon className="size-4" /> Chat with us
            </a>
          )}
          <span className="hidden text-white/30 sm:inline" aria-hidden>|</span>
          <Link href="/faq" className="hidden rounded hover:text-orange-300 sm:inline">Help</Link>
        </nav>
      </div>
    </div>
  );
}
