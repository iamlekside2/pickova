import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3009").replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/shop", "/new-arrivals", "/about", "/contact", "/faq", "/shipping-returns", "/privacy", "/terms", "/track-order"];
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "daily" : "weekly" }));

  try {
    const [categories, first] = await Promise.all([getCategories(), getProducts({ pageSize: 48 })]);
    for (const c of categories) entries.push({ url: `${siteUrl}/collections/${c.slug}`, changeFrequency: "daily" });
    const pages = [first];
    for (let page = 2; page <= first.totalPages; page++) pages.push(await getProducts({ pageSize: 48, page }));
    for (const p of pages.flatMap((r) => r.items)) entries.push({ url: `${siteUrl}/products/${p.slug}`, changeFrequency: "daily" });
  } catch {
    // If the API is down, still serve the static part of the sitemap.
  }
  return entries;
}
