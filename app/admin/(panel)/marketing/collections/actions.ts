"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/catalog-data";

export type CollectionFormState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = base || "collection";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function parseMonths(raw: string): string {
  const months = raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
  return JSON.stringify(Array.from(new Set(months)).sort((a, b) => a - b));
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slugInput: String(formData.get("slug") ?? "").trim(),
    active: formData.get("active") === "on",
    months: parseMonths(String(formData.get("months") ?? "")),
    emoji: String(formData.get("emoji") ?? "").trim(),
    icon: String(formData.get("icon") ?? "Flame").trim() || "Flame",
    heroHeadline: String(formData.get("heroHeadline") ?? "").trim(),
    heroSubtext: String(formData.get("heroSubtext") ?? "").trim(),
    heroImage: String(formData.get("heroImage") ?? "").trim(),
    themeFrom: String(formData.get("themeFrom") ?? "#0A6640").trim() || "#0A6640",
    themeTo: String(formData.get("themeTo") ?? "#0d7a4d").trim() || "#0d7a4d",
  };
}

export async function createCollection(
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Collection name is required." };

  const slug = await uniqueSlug(slugify(d.slugInput || d.name));
  await prisma.collection.create({
    data: {
      name: d.name,
      slug,
      active: d.active,
      months: d.months,
      emoji: d.emoji,
      icon: d.icon,
      heroHeadline: d.heroHeadline,
      heroSubtext: d.heroSubtext,
      heroImage: d.heroImage,
      themeFrom: d.themeFrom,
      themeTo: d.themeTo,
    },
  });
  revalidatePath("/admin/marketing/collections");
  redirect("/admin/marketing/collections");
}

export async function updateCollection(
  id: string,
  _prev: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Collection name is required." };

  const slug = await uniqueSlug(slugify(d.slugInput || d.name), id);
  await prisma.collection.update({
    where: { id },
    data: {
      name: d.name,
      slug,
      active: d.active,
      months: d.months,
      emoji: d.emoji,
      icon: d.icon,
      heroHeadline: d.heroHeadline,
      heroSubtext: d.heroSubtext,
      heroImage: d.heroImage,
      themeFrom: d.themeFrom,
      themeTo: d.themeTo,
    },
  });
  revalidatePath("/admin/marketing/collections");
  revalidatePath(`/seasons/${slug}`);
  redirect("/admin/marketing/collections");
}

export async function deleteCollection(id: string): Promise<void> {
  await requireAdmin();
  // Products keep their records; their collectionId is cleared (optional relation).
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/marketing/collections");
  redirect("/admin/marketing/collections");
}
