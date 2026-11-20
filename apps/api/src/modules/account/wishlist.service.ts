import type { ProductSummaryDTO } from "@pickova/shared";
import { notFound } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { summarySelect, toSummary } from "../catalog/catalog.service";

/** Saved products, newest first. Products that are no longer on sale are left out. */
export async function listWishlist(userId: string): Promise<ProductSummaryDTO[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId, product: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    select: { product: { select: summarySelect } },
  });
  return rows.map((r) => toSummary(r.product));
}

export async function addToWishlist(userId: string, productId: string): Promise<void> {
  const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } });
  if (!product) throw notFound("We couldn't find that product.");
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}

/** Adds device-saved items to the account (unknown ids are ignored) and returns the full list. */
export async function mergeWishlist(userId: string, productIds: string[]): Promise<ProductSummaryDTO[]> {
  if (productIds.length > 0) {
    const valid = await prisma.product.findMany({ where: { id: { in: productIds }, status: "ACTIVE" }, select: { id: true } });
    await prisma.wishlistItem.createMany({ data: valid.map((p) => ({ userId, productId: p.id })), skipDuplicates: true });
  }
  return listWishlist(userId);
}
