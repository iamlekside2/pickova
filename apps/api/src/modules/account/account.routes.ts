import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import {
  addressSchema,
  changePasswordSchema,
  pageQuerySchema,
  profileSchema,
  savedCartSchema,
  wishlistMergeSchema,
  type AccountOverviewDTO,
  type UserDTO,
} from "@pickova/shared";
import { HttpError, parse } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { setSessionCookie, signSession } from "../../lib/session";
import { requireAuth } from "../../middleware/auth";
import { authLimiter } from "../../middleware/security";
import { BCRYPT_ROUNDS } from "../auth/password-reset.service";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "./addresses.service";
import { getOrder, listOrders } from "./orders.service";
import { getSavedCart, saveCart } from "./saved-cart.service";
import { addToWishlist, listWishlist, mergeWishlist, removeFromWishlist } from "./wishlist.service";

/**
 * Everything under /account belongs to the signed-in customer. Every query is
 * scoped by `req.user.id` taken from the verified session — never from the
 * URL or body — so one customer can never read or change another's data.
 */
export const accountRouter = Router();
accountRouter.use("/account", requireAuth, (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const idParam = z.string().min(1).max(40);
const userSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, role: true } as const;

accountRouter.get("/account/overview", async (req, res) => {
  const userId = req.user!.id;
  const [orders, wishlistCount, addresses] = await Promise.all([
    listOrders(userId, 1, 3),
    prisma.wishlistItem.count({ where: { userId, product: { status: "ACTIVE" } } }),
    listAddresses(userId),
  ]);
  const overview: AccountOverviewDTO = {
    orderCount: orders.total,
    wishlistCount,
    addressCount: addresses.length,
    recentOrders: orders.items,
    defaultAddress: addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
  };
  res.json(overview);
});

// ── Profile ──────────────────────────────────────────────────────────────

accountRouter.patch("/account/profile", async (req, res) => {
  const input = parse(profileSchema, req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { firstName: input.firstName, lastName: input.lastName, phone: input.phone ?? null },
    select: userSelect,
  });
  res.json({ user: user satisfies UserDTO });
});

accountRouter.post("/account/change-password", authLimiter, async (req, res) => {
  const input = parse(changePasswordSchema, req.body);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id }, select: { passwordHash: true } });
  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw new HttpError(422, "VALIDATION_ERROR", "Please check the highlighted fields.", { currentPassword: ["That isn't your current password."] });
  }
  // Bumping tokenVersion signs out every other device; this one gets a fresh cookie.
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS), tokenVersion: { increment: 1 } },
    select: { id: true, role: true, tokenVersion: true },
  });
  setSessionCookie(res, await signSession({ sub: updated.id, role: updated.role, tv: updated.tokenVersion }));
  res.json({ ok: true });
});

// ── Addresses ────────────────────────────────────────────────────────────

accountRouter.get("/account/addresses", async (req, res) => {
  res.json(await listAddresses(req.user!.id));
});

accountRouter.post("/account/addresses", async (req, res) => {
  res.status(201).json(await createAddress(req.user!.id, parse(addressSchema, req.body)));
});

accountRouter.put("/account/addresses/:id", async (req, res) => {
  res.json(await updateAddress(req.user!.id, parse(idParam, req.params.id), parse(addressSchema, req.body)));
});

accountRouter.delete("/account/addresses/:id", async (req, res) => {
  await deleteAddress(req.user!.id, parse(idParam, req.params.id));
  res.json({ ok: true });
});

// ── Orders ───────────────────────────────────────────────────────────────

accountRouter.get("/account/orders", async (req, res) => {
  const { page, pageSize } = parse(pageQuerySchema, req.query);
  res.json(await listOrders(req.user!.id, page, pageSize));
});

accountRouter.get("/account/orders/:reference", async (req, res) => {
  res.json(await getOrder(req.user!.id, parse(z.string().min(4).max(40), req.params.reference)));
});

// ── Wishlist ─────────────────────────────────────────────────────────────

accountRouter.get("/account/wishlist", async (req, res) => {
  res.json(await listWishlist(req.user!.id));
});

accountRouter.post("/account/wishlist/merge", async (req, res) => {
  const { productIds } = parse(wishlistMergeSchema, req.body);
  res.json(await mergeWishlist(req.user!.id, productIds));
});

accountRouter.put("/account/wishlist/:productId", async (req, res) => {
  await addToWishlist(req.user!.id, parse(idParam, req.params.productId));
  res.json({ ok: true });
});

accountRouter.delete("/account/wishlist/:productId", async (req, res) => {
  await removeFromWishlist(req.user!.id, parse(idParam, req.params.productId));
  res.json({ ok: true });
});

// ── Saved cart ───────────────────────────────────────────────────────────

accountRouter.get("/account/cart", async (req, res) => {
  res.json(await getSavedCart(req.user!.id));
});

accountRouter.put("/account/cart", async (req, res) => {
  res.json(await saveCart(req.user!.id, parse(savedCartSchema, req.body)));
});
