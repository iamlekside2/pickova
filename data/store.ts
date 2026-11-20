/**
 * Store settings — the things the owner is most likely to change.
 * Edit this file and redeploy; there is no database or admin panel.
 */

type StoreSettings = {
  whatsappNumber: string;
  contact: { phone: string; email: string; address: string };
  social: { instagram: string; tiktok: string; facebook: string; x: string };
  announcements: string[];
  promo: { title: string; subtitle: string; ctaLabel: string; ctaHref: string } | null;
  sampleCatalogue: boolean;
};

export const STORE: StoreSettings = {
  /**
   * WhatsApp number that receives orders, in international format with no
   * "+" or spaces. Every "Order on WhatsApp" button opens a chat with it.
   */
  whatsappNumber: "2347068736818",

  /** Extra contact details for the footer and Contact page. Empty values are hidden. */
  contact: {
    phone: "",
    email: "",
    address: "",
  },

  /** Full profile URLs. Empty values are hidden. */
  social: {
    instagram: "",
    tiktok: "",
    facebook: "",
    x: "",
  },

  /** Messages in the bar at the very top of every page. */
  announcements: ["Fast delivery across Nigeria", "Real photos. Honest prices. Order on WhatsApp."],

  /** The wide banner on the homepage. Set to null to hide it. */
  promo: {
    title: "Fresh pairs, honest prices",
    subtitle: "New styles land every week. See what just arrived before your size is gone.",
    ctaLabel: "Shop New Arrivals",
    ctaHref: "/new-arrivals",
  },

  /**
   * While true, a strip at the top says the listings are samples. Switch to
   * false once data/products.ts holds your real products, prices and photos.
   */
  sampleCatalogue: true,
};
