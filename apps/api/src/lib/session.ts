import type { CookieOptions, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@pickova/shared";
import { env, isProd } from "../env";

export const SESSION_COOKIE = "pkv_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const secret = new TextEncoder().encode(env.JWT_SECRET);

export type SessionClaims = { sub: string; role: Role; tv: number };

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ role: claims.role, tv: claims.tv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer("pickova")
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: "pickova", algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.tv !== "number") return null;
    return { sub: payload.sub, role: payload.role as Role, tv: payload.tv };
  } catch {
    return null;
  }
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true, // never readable from JavaScript
    secure: isProd,
    sameSite: "lax",
    path: "/",
    domain: env.COOKIE_DOMAIN,
  };
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: MAX_AGE_SECONDS * 1000 });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}
