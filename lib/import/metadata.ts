// Metadata importer: fetches a product page and reads its Open Graph + JSON-LD
// tags. Works on sites that expose those (many do); when a site blocks the
// fetch or omits the data, it returns a clear error and the admin falls back to
// manual entry. `parseProductHtml` is pure so it can be unit-tested.

import type { ImportResult, ProductDraft, ProductImporter } from "./types";

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

function metaContent(html: string, property: string): string {
  // Matches <meta property="og:title" content="..."> in either attribute order.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return decode(m[1]);
  }
  return "";
}

function firstJsonLdProduct(html: string): Record<string, unknown> | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      const data = JSON.parse(match[1].trim());
      const candidates = Array.isArray(data) ? data : [data, ...(Array.isArray(data["@graph"]) ? data["@graph"] : [])];
      for (const c of candidates) {
        const type = c && c["@type"];
        const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
        if (isProduct) return c as Record<string, unknown>;
      }
    } catch {
      /* ignore malformed json-ld */
    }
  }
  return null;
}

function extractOffer(product: Record<string, unknown>): { price: number; currency: string } {
  let offers = product.offers as unknown;
  if (Array.isArray(offers)) offers = offers[0];
  const o = (offers ?? {}) as Record<string, unknown>;
  const price = Number(o.price ?? o.lowPrice ?? 0);
  const currency = String(o.priceCurrency ?? "");
  return { price: Number.isFinite(price) ? price : 0, currency };
}

export function parseProductHtml(html: string, sourceUrl: string): ProductDraft | null {
  const ld = firstJsonLdProduct(html);

  let name = ld ? String(ld.name ?? "") : "";
  let imageUrl = "";
  let costPrice = 0;
  let currency = "";
  let description = ld ? String(ld.description ?? "") : "";

  if (ld) {
    const img = ld.image as unknown;
    imageUrl = Array.isArray(img) ? String(img[0] ?? "") : String(img ?? "");
    const offer = extractOffer(ld);
    costPrice = offer.price;
    currency = offer.currency;
  }

  // Open Graph fallbacks.
  if (!name) name = metaContent(html, "og:title");
  if (!imageUrl) imageUrl = metaContent(html, "og:image");
  if (!description) description = metaContent(html, "og:description");
  if (!costPrice) {
    const p =
      metaContent(html, "product:price:amount") ||
      metaContent(html, "og:price:amount");
    const n = Number(p);
    if (Number.isFinite(n)) costPrice = n;
  }
  if (!currency) {
    currency =
      metaContent(html, "product:price:currency") ||
      metaContent(html, "og:price:currency") ||
      "";
  }

  // Last-resort name from <title>.
  if (!name) {
    const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (t) name = decode(t[1]);
  }

  if (!name) return null;

  return {
    name,
    imageUrl,
    costPrice: Math.max(0, Math.round(costPrice)),
    currency,
    sourceUrl,
    description,
  };
}

export const metadataImporter: ProductImporter = {
  key: "metadata",
  async fetchDraft(url: string): Promise<ImportResult> {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          // Browser-like UA improves the odds on some sites (many still block).
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
          Accept: "text/html",
        },
        cache: "no-store",
      });
    } catch (err) {
      return { ok: false, error: `Couldn't reach that URL (${String(err)}).` };
    }

    if (!res.ok) {
      return {
        ok: false,
        error: `The source returned ${res.status}. It may block automated fetches — add the product manually.`,
      };
    }

    const html = await res.text();
    const draft = parseProductHtml(html, url);
    if (!draft) {
      return {
        ok: false,
        error: "Couldn't read product details from that page. Add it manually.",
      };
    }
    return { ok: true, draft };
  },
};
