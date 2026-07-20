"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter, FaTiktok } from "react-icons/fa6";
import { LogoMark } from "@/components/Logo";

const SOCIALS = [
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/2348000000000" },
  { icon: FaInstagram, label: "Instagram", href: "https://instagram.com" },
  { icon: FaXTwitter, label: "X (Twitter)", href: "https://x.com" },
  { icon: FaTiktok, label: "TikTok", href: "https://tiktok.com" },
  { icon: FaFacebook, label: "Facebook", href: "https://facebook.com" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="mt-10 bg-brand-green px-6 pb-8 pt-12">
      <div className="mx-auto flex max-w-content flex-wrap justify-between gap-10">
        {/* Brand */}
        <div className="max-w-sm">
          <div className="mb-3.5 flex items-center gap-2.5">
            <LogoMark size={30} variant="plain" />
            <div className="font-display text-[22px] font-extrabold text-white">Pickova</div>
          </div>
          <p className="m-0 text-sm leading-relaxed text-white/75">
            Pick the moment. Own the season. Naija&apos;s seasonal pick, delivered fast, paid
            secure.
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-btn bg-white/[0.12] px-3 py-1.5 text-xs font-bold text-white">
              <ShieldCheck size={14} /> Paystack Secured
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/80 transition-colors hover:text-brand-gold"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex-[0_1_340px]">
          <div className="mb-1.5 font-display text-base font-bold text-white">
            No miss the next drop
          </div>
          <p className="m-0 mb-3.5 text-[13px] text-white/70">
            Drop your email, we go gist you when new season land.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setSubscribed(true);
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 rounded-full border-none px-4 py-3 text-sm text-brand-ink outline-none"
            />
            <button
              type="submit"
              className="whitespace-nowrap rounded-full bg-brand-gold px-5 py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover"
            >
              Subscribe
            </button>
          </form>
          {subscribed && (
            <div className="mt-2.5 text-[13px] font-semibold text-brand-gold">
              You dey inside now ✓
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-content border-t border-white/15 pt-5 text-xs text-white/55">
        © 2026 Pickova. All rights reserved. · Pick the moment. Own the season.
      </div>
    </footer>
  );
}
