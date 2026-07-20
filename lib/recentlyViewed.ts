// Client-only tracker for products a shopper has viewed. Persisted in
// localStorage so it survives reloads. Most-recent first, capped at MAX.
// (Server-driven "best sellers" etc. come later, once the backend exists.)

const KEY = "pickova:recently-viewed";
const MAX = 12;

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function recordView(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const rest = getRecentlyViewed().filter((x) => x !== id);
    const next = [id, ...rest].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    // Let other components on the page refresh (e.g. a homepage rail).
    window.dispatchEvent(new Event("pickova:recently-viewed"));
  } catch {
    // storage disabled or over quota — non-critical, ignore
  }
}
