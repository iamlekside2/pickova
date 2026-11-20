import type { NextFunction, Request, Response } from "express";
import type { Role, UserDTO } from "@pickova/shared";
import { forbidden, unauthorized } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { SESSION_COOKIE, verifySession } from "../lib/session";

declare module "express-serve-static-core" {
  interface Request {
    user?: UserDTO;
  }
}

/** Resolves the signed-in user, if any. Never rejects the request. */
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    const claims = await verifySession(token);
    if (claims) {
      // Re-read the user so deactivation, role changes and logout-everywhere
      // take effect immediately rather than when the token expires.
      const user = await prisma.user.findUnique({
        where: { id: claims.sub },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, tokenVersion: true },
      });
      if (user && user.isActive && user.tokenVersion === claims.tv) {
        const { isActive: _a, tokenVersion: _t, ...dto } = user;
        req.user = dto;
      }
    }
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) throw unauthorized();
  next();
}

/** Role-based authorisation, e.g. `requireRole("ADMIN", "STAFF")`. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}
