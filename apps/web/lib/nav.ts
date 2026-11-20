export type NavLink = { label: string; href: string };

export const SHOP_MENU: NavLink[] = [
  { label: "Shop All", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Sports Sneakers", href: "/collections/sports" },
  { label: "Casual Shoes", href: "/collections/casual" },
];

export const MAIN_NAV: (NavLink & { children?: NavLink[] })[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop", children: SHOP_MENU },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "Kids", href: "/collections/kids" },
  { label: "About", href: "/about" },
];

export const FOOTER_NAV: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Men", href: "/collections/men" },
      { label: "Women", href: "/collections/women" },
      { label: "Kids", href: "/collections/kids" },
      { label: "Sports Sneakers", href: "/collections/sports" },
      { label: "Casual Shoes", href: "/collections/casual" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Your Order", href: "/track-order" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "FAQs", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Pickova",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];

/** Copy for the collection landing pages. */
export const COLLECTION_COPY: Record<string, { title: string; blurb: string }> = {
  men: { title: "Men's Collection", blurb: "Everyday sneakers and casual shoes for men — from clean court classics to cushioned runners." },
  women: { title: "Women's Collection", blurb: "Comfortable, stylish pairs for work, outings and everything in between." },
  kids: { title: "Kids' Collection", blurb: "Tough, comfy shoes that keep up with school days and playtime." },
  sports: { title: "Sports Sneakers", blurb: "Lightweight, cushioned sneakers for training, running and match day." },
  casual: { title: "Casual Shoes", blurb: "Easy pairs for the office, the weekend and the in-between." },
};
