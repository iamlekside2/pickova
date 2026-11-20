import { Router } from "express";
import { newsletterSchema } from "@pickova/shared";
import { parse } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { publicWriteLimiter } from "../../middleware/security";
import { getStorefrontSettings, listActiveBanners, listDeliveryZones } from "./settings.service";

export const storeRouter = Router();

storeRouter.get("/store/settings", async (_req, res) => {
  res.json(await getStorefrontSettings());
});

storeRouter.get("/store/banners", async (_req, res) => {
  res.json(await listActiveBanners());
});

storeRouter.get("/store/delivery-zones", async (_req, res) => {
  res.json(await listDeliveryZones());
});

storeRouter.post("/newsletter", publicWriteLimiter, async (req, res) => {
  const { email } = parse(newsletterSchema, req.body);
  // Upsert so the response is identical whether or not the address was
  // already subscribed — the endpoint cannot be used to probe for emails.
  await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } });
  res.status(201).json({ ok: true });
});
