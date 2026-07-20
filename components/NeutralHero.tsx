"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { naira } from "@/lib/format";
import { NEUTRAL_THEME } from "@/lib/theme";
import { unsplashUrl } from "@/lib/catalog-data";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

const HERO_OVERLAY =
  "linear-gradient(100deg, rgba(6,38,24,0.92) 0%, rgba(6,38,24,0.68) 38%, rgba(6,38,24,0.15) 66%, rgba(6,38,24,0) 85%)";

// Neutral, season-agnostic storefront banner.
const HERO_IMAGE = unsplashUrl("1441986300917-64674bd600d8", 1600, 640);

export function NeutralHero({ lowestPrice }: { lowestPrice: number }) {
  return (
    <section className="relative h-[460px] w-full overflow-hidden bg-brand-green sm:h-[500px]">
      {/* Full-bleed banner */}
      <div className="absolute inset-0 z-0">
        <ImagePlaceholder
          from={NEUTRAL_THEME.themeFrom}
          to={NEUTRAL_THEME.themeTo}
          src={HERO_IMAGE}
          label="Pickova store banner"
          hero
        />
      </div>
      <div className="absolute inset-0 z-[1]" style={{ background: HERO_OVERLAY }} />

      {/* Content */}
      <div className="relative z-[2] mx-auto flex h-full max-w-content items-center px-6">
        <div className="max-w-[600px] px-1 sm:px-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="border-b-2 border-brand-gold pb-1 text-sm font-bold uppercase tracking-[1.5px] text-brand-gold">
              Naija&apos;s Everyday Store
            </span>
          </div>
          <h1 className="m-0 mb-4 font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] text-white">
            Pick am correct, any day any time.
          </h1>
          <p className="m-0 mb-7 max-w-[460px] text-[17px] leading-relaxed text-white/85">
            Fashion, gadgets, home, beauty, grocery and more — curated picks
            delivered fast and paid secure. No need to wait for any season.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#picks"
              className="flex items-center gap-1.5 rounded-lg bg-brand-gold px-8 py-4 font-display text-base font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover"
            >
              Shop Now
              <ArrowRight size={18} />
            </a>
            <span className="text-[15px] font-extrabold text-brand-gold">
              From {naira(lowestPrice)}
            </span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[13px] font-semibold text-white/80">
            <ShieldCheck size={16} className="text-brand-gold" />
            Order on WhatsApp · Pay secure with Paystack
          </div>
        </div>
      </div>
    </section>
  );
}
