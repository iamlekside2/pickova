import { Truck } from "lucide-react";
import Link from "next/link";
import type { BannerDTO } from "@pickova/shared";

export function AnnouncementBar({ announcements }: { announcements: BannerDTO[] }) {
  const messages = announcements.length ? announcements.map((a) => a.title) : ["Fast delivery across Nigeria"];
  return (
    <div className="bg-navy-800 text-white">
      <div className="container-page flex min-h-10 items-center justify-between gap-4 text-xs sm:text-[0.8125rem]">
        <p className="flex min-w-0 items-center gap-2 font-medium">
          <Truck className="size-4 shrink-0 text-orange" aria-hidden />
          <span className="truncate">
            {messages[0]}
            {messages.slice(1).map((m) => (
              <span key={m} className="hidden lg:inline">
                <span className="mx-2.5 text-white/30" aria-hidden>|</span>
                {m}
              </span>
            ))}
          </span>
        </p>
        <nav aria-label="Quick links" className="flex shrink-0 items-center gap-3 font-medium sm:gap-4">
          <Link href="/track-order" className="rounded hover:text-orange-300">Track Order</Link>
          <span className="hidden text-white/30 sm:inline" aria-hidden>|</span>
          <Link href="/faq" className="hidden rounded hover:text-orange-300 sm:inline">Help</Link>
        </nav>
      </div>
    </div>
  );
}
