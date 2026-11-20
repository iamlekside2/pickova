import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../env";
import { forbidden } from "../lib/errors";

const limited = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => env.NODE_ENV === "test",
    message: { error: { code: "RATE_LIMITED", message } },
  });

/** Baseline for the whole API. */
export const generalLimiter = limited(60_000, 300, "Too many requests. Please slow down.");
/** Credential endpoints: slows password guessing. */
export const authLimiter = limited(15 * 60_000, 20, "Too many attempts. Please try again in a few minutes.");
/** Public write / lookup endpoints (newsletter, order tracking). */
export const publicWriteLimiter = limited(10 * 60_000, 30, "Too many requests. Please try again shortly.");

/**
 * CSRF defence for cookie-authenticated requests: browsers always send Origin
 * on cross-site state-changing requests, so reject any that is not ours.
 * Server-to-server calls (webhooks) carry no Origin and are authenticated by
 * their own signatures.
 */
export function originGuard(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !env.WEB_ORIGIN.includes(origin.replace(/\/$/, ""))) throw forbidden("Cross-site request blocked.");
  next();
}
