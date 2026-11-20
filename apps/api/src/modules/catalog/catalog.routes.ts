import { Router } from "express";
import { z } from "zod";
import { productQuerySchema } from "@pickova/shared";
import { parse } from "../../lib/errors";
import { getFacets, getProduct, listCategories, listFeaturedReviews, listProducts } from "./catalog.service";

export const catalogRouter = Router();

catalogRouter.get("/products", async (req, res) => {
  res.json(await listProducts(parse(productQuerySchema, req.query)));
});

catalogRouter.get("/products/facets", async (_req, res) => {
  res.json(await getFacets());
});

catalogRouter.get("/products/:slug", async (req, res) => {
  res.json(await getProduct(parse(z.string().min(1).max(120), req.params.slug)));
});

catalogRouter.get("/categories", async (_req, res) => {
  res.json(await listCategories());
});

catalogRouter.get("/reviews/featured", async (req, res) => {
  const { limit } = parse(z.object({ limit: z.coerce.number().int().min(1).max(12).default(6) }), req.query);
  res.json(await listFeaturedReviews(limit));
});
