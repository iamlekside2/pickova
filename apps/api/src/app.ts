import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env, isProd } from "./env";
import { prisma } from "./lib/prisma";
import { loadUser } from "./middleware/auth";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { generalLimiter, originGuard } from "./middleware/security";
import { accountRouter } from "./modules/account/account.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { cartRouter } from "./modules/cart/cart.routes";
import { catalogRouter } from "./modules/catalog/catalog.routes";
import { checkoutRouter } from "./modules/checkout/checkout.routes";
import { trackingRouter } from "./modules/orders/tracking.routes";
import { storeRouter } from "./modules/store/store.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Behind one reverse proxy in production (needed for correct client IPs and secure cookies).
  if (isProd) app.set("trust proxy", 1);

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
  app.use(generalLimiter);
  app.use(
    express.json({
      limit: "100kb",
      // Webhook signatures are computed over the exact bytes received, so keep them.
      verify: (req, _res, buf) => {
        if (req.url?.startsWith("/api/v1/webhooks/")) (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(cookieParser());
  app.use(originGuard);

  app.get("/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  });

  const v1 = express.Router();
  v1.use(loadUser);
  v1.use(catalogRouter, storeRouter, cartRouter, authRouter, trackingRouter, accountRouter, checkoutRouter);
  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
