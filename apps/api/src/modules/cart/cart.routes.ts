import { Router } from "express";
import { cartQuoteSchema } from "@pickova/shared";
import { parse } from "../../lib/errors";
import { quoteCart } from "./quote.service";

export const cartRouter = Router();

/** Server-side pricing and availability check for a cart. */
cartRouter.post("/cart/quote", async (req, res) => {
  res.json(await quoteCart(parse(cartQuoteSchema, req.body)));
});
