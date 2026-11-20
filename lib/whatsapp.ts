import { STORE } from "@/data/store";
import { formatNaira, type OrderDetails, type Quote, type QuoteLine } from "@/lib/shared";

/** True once a real WhatsApp number is configured in data/store.ts. */
export const hasWhatsApp = /^\d{10,15}$/.test(STORE.whatsappNumber);

/** A wa.me link that opens a chat with the store and the message pre-filled. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

const lineText = (l: QuoteLine, i: number) =>
  `${i + 1}. ${l.name} — ${l.colourName}, size ${l.sizeLabel} × ${l.quantity} = ${formatNaira(l.lineTotalKobo)}\n   Code: ${l.variantId}`;

/**
 * The order as a WhatsApp message. The customer sees it in the chat box and
 * presses send themselves, so nothing is sent without them seeing it.
 */
export function buildOrderMessage(quote: Quote, details: OrderDetails): string {
  const lines = quote.lines.filter((l) => l.issue === null);
  return [
    "Hello Pickova! I'd like to order:",
    "",
    ...lines.map(lineText),
    "",
    `Subtotal: ${formatNaira(quote.subtotalKobo)}`,
    quote.deliveryFeeKobo !== null ? `Delivery to ${details.state} (estimate): ${formatNaira(quote.deliveryFeeKobo)}` : `Delivery to ${details.state}: to be confirmed`,
    `Estimated total: ${formatNaira(quote.totalKobo)}`,
    "",
    `Name: ${details.customerName}`,
    `Phone: ${details.phone}`,
    `Deliver to: ${details.address}, ${details.city}, ${details.state}`,
    ...(details.note ? [`Note: ${details.note}`] : []),
    "",
    "Please confirm availability and how to pay. Thank you!",
  ].join("\n");
}

/** A quick question about one product, from its page. */
export function buildEnquiryMessage(product: { name: string; slug: string }, choice?: { colour?: string; size?: string; code?: string }): string {
  const picked = [choice?.colour, choice?.size ? `size ${choice.size}` : null].filter(Boolean).join(", ");
  return [
    `Hello Pickova! I'm interested in the ${product.name}${picked ? ` (${picked})` : ""}.`,
    ...(choice?.code ? [`Code: ${choice.code}`] : []),
    "Is it available?",
  ].join("\n");
}
