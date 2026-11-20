import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/lib/catalog";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3009").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/shop", "/new-arrivals", "/about", "/contact", "/faq", "/shipping-returns", "/privacy", "/terms"];
  return [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? ("daily" as const) : ("weekly" as const) })),
    ...getCategories().map((c) => ({ url: `${siteUrl}/collections/${c.slug}`, changeFrequency: "weekly" as const })),
    ...getAllProductSlugs().map((slug) => ({ url: `${siteUrl}/products/${slug}`, changeFrequency: "weekly" as const })),
  ];
}
