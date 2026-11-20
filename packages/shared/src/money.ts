/** All amounts in Pickova are integer kobo. ₦1 = 100 kobo. */

const formatter = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** 8500000 → "₦85,000" (kobo shown only when not a whole naira). */
export function formatNaira(kobo: number): string {
  return `₦${formatter.format(kobo / 100)}`;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/** Whole-percent saving of `price` against a higher "was" price, or null. */
export function discountPercent(priceKobo: number, compareAtKobo: number | null | undefined): number | null {
  if (!compareAtKobo || compareAtKobo <= priceKobo) return null;
  return Math.round(((compareAtKobo - priceKobo) / compareAtKobo) * 100);
}
