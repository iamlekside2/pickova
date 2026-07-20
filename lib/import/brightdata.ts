// Bright Data importer — fetches the page through Bright Data's Web Unlocker so
// bot-protected retailers (Amazon, AliExpress, Jumia) return real HTML, then
// reuses the same `parseProductHtml` parser. Enabled when BRIGHTDATA_API_KEY is
// set; otherwise it reports "not configured" and the admin uses the standard
// importer or manual entry.

import type { ImportResult, ProductImporter } from "./types";
import { parseProductHtml } from "./metadata";

const API_KEY = process.env.BRIGHTDATA_API_KEY ?? "";
const ZONE = process.env.BRIGHTDATA_ZONE ?? "web_unlocker1";

export function isBrightDataConfigured(): boolean {
  return API_KEY.length > 0;
}

export const brightDataImporter: ProductImporter = {
  key: "brightdata",
  async fetchDraft(url: string): Promise<ImportResult> {
    if (!isBrightDataConfigured()) {
      return {
        ok: false,
        error: "Bright Data isn't configured. Set BRIGHTDATA_API_KEY to enable it.",
      };
    }

    let res: Response;
    try {
      res = await fetch("https://api.brightdata.com/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zone: ZONE, url, format: "raw" }),
        cache: "no-store",
      });
    } catch (err) {
      return { ok: false, error: `Bright Data request failed (${String(err)}).` };
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Bright Data returned ${res.status}${detail ? ` — ${detail.slice(0, 120)}` : ""}.`,
      };
    }

    const html = await res.text();
    const draft = parseProductHtml(html, url);
    if (!draft) {
      return {
        ok: false,
        error: "Fetched the page but couldn't read product details from it.",
      };
    }
    return { ok: true, draft };
  },
};
