import type { Product, ProductSource } from "./types";
import { naira } from "./format";

/**
 * Build an affiliate search/deep link for a product.
 *
 * The prototype photography and catalogue are placeholders, so instead of
 * hard-coded product URLs we generate an affiliate search link on the given
 * marketplace. The Jumia affiliate id (if configured) is appended so clicks
 * are attributed. Konga has no public affiliate param here, so we just search.
 */
export function buildAffiliateUrl(
  productName: string,
  source: ProductSource,
): string {
  const query = encodeURIComponent(productName);
  const affiliateId = process.env.NEXT_PUBLIC_JUMIA_AFFILIATE_ID ?? "";

  if (source === "konga") {
    return `https://www.konga.com/search?search=${query}`;
  }

  // "jumia" and "local" both fall back to a Jumia search link.
  const base = `https://www.jumia.com.ng/catalog/?q=${query}`;
  return affiliateId ? `${base}&aff=${affiliateId}` : base;
}

/**
 * Build the WhatsApp "click to order" deep link for a product.
 * Opens WhatsApp with a prefilled order message to the store number.
 */
export function whatsappOrderUrl(product: Pick<Product, "name" | "price">): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000";
  const message = `Hi, I want to order: ${product.name} - ${naira(
    product.price,
  )} from Pickova`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Human label for a product's sourcing marketplace. */
export function sourceLabel(source: ProductSource): string {
  switch (source) {
    case "jumia":
      return "Jumia";
    case "konga":
      return "Konga";
    default:
      return "Pickova Local";
  }
}
