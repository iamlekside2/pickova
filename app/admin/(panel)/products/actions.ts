"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/catalog-data";
import { PRODUCT_STATUS, type ProductStatus } from "@/lib/constants";

export type ProductFormState = { error?: string };

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
}

/** Ensure a slug is unique, ignoring the product being edited. */
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = base || "product";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Math.max(0, Math.round(Number(formData.get("price") ?? 0)));
  const costPrice = Math.max(0, Math.round(Number(formData.get("costPrice") ?? 0)));
  const stock = Math.max(0, Math.round(Number(formData.get("stock") ?? 0)));
  const statusRaw = String(formData.get("status") ?? "active");
  const status: ProductStatus = (PRODUCT_STATUS as readonly string[]).includes(statusRaw)
    ? (statusRaw as ProductStatus)
    : "active";
  const categoryId = String(formData.get("categoryId") ?? "");
  const collectionId = String(formData.get("collectionId") ?? "");
  const supplierId = String(formData.get("supplierId") ?? "");
  const supplierSku = String(formData.get("supplierSku") ?? "").trim();
  const source = String(formData.get("source") ?? "local");
  const affiliateUrl = String(formData.get("affiliateUrl") ?? "").trim();

  const images = String(formData.get("images") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    name,
    description,
    price,
    costPrice,
    stock,
    status,
    categoryId,
    collectionId: collectionId || null,
    supplierId: supplierId || null,
    supplierSku: supplierSku || null,
    source,
    affiliateUrl,
    images,
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const d = parseForm(formData);
  if (!d.name) return { error: "Product name is required." };
  if (!d.categoryId) return { error: "Please choose a category." };
  if (d.price <= 0) return { error: "Price must be greater than zero." };

  const slug = await uniqueSlug(slugify(d.name));
  await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.description,
      price: d.price,
      costPrice: d.costPrice,
      stock: d.stock,
      status: d.status,
      categoryId: d.categoryId,
      collectionId: d.collectionId,
      supplierId: d.supplierId,
      supplierSku: d.supplierSku,
      source: d.source,
      affiliateUrl: d.affiliateUrl,
      images: JSON.stringify(d.images),
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();
  const d = parseForm(formData);
  if (!d.name) return { error: "Product name is required." };
  if (!d.categoryId) return { error: "Please choose a category." };
  if (d.price <= 0) return { error: "Price must be greater than zero." };

  const slug = await uniqueSlug(slugify(d.name), id);
  await prisma.product.update({
    where: { id },
    data: {
      name: d.name,
      slug,
      description: d.description,
      price: d.price,
      costPrice: d.costPrice,
      stock: d.stock,
      status: d.status,
      categoryId: d.categoryId,
      collectionId: d.collectionId,
      supplierId: d.supplierId,
      supplierSku: d.supplierSku,
      source: d.source,
      affiliateUrl: d.affiliateUrl,
      images: JSON.stringify(d.images),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
