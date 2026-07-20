"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/catalog-data";

export type CategoryFormState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = base || "category";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "Flame").trim() || "Flame",
    blurb: String(formData.get("blurb") ?? "").trim(),
    sortOrder: Math.round(Number(formData.get("sortOrder") ?? 0)) || 0,
  };
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Category name is required." };

  const existingName = await prisma.category.findUnique({ where: { name: d.name } });
  if (existingName) return { error: "A category with that name already exists." };

  const slug = await uniqueSlug(slugify(d.name));
  await prisma.category.create({
    data: { name: d.name, slug, icon: d.icon, blurb: d.blurb, sortOrder: d.sortOrder },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const d = parse(formData);
  if (!d.name) return { error: "Category name is required." };

  const existingName = await prisma.category.findUnique({ where: { name: d.name } });
  if (existingName && existingName.id !== id) {
    return { error: "A category with that name already exists." };
  }

  const slug = await uniqueSlug(slugify(d.name), id);
  await prisma.category.update({
    where: { id },
    data: { name: d.name, slug, icon: d.icon, blurb: d.blurb, sortOrder: d.sortOrder },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    // Blocked — products still reference it. Bounce back with a flag.
    redirect(`/admin/categories/${id}?error=has-products`);
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
