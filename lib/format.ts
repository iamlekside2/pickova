/** Format a number as Nigerian Naira, e.g. 15000 -> "₦15,000". */
export function naira(value: number): string {
  return "₦" + value.toLocaleString("en-NG");
}

/** Clamp a rating into the 0–5 range and round to one decimal. */
export function normalizeRating(rating: number): number {
  return Math.max(0, Math.min(5, Math.round(rating * 10) / 10));
}
