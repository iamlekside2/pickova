import bcrypt from "bcryptjs";
import { Router } from "express";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, type UserDTO } from "@pickova/shared";
import { BCRYPT_ROUNDS, createPasswordReset, resetPassword, sendPasswordResetEmail } from "./password-reset.service";
import { HttpError, conflict, parse } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { clearSessionCookie, setSessionCookie, signSession } from "../../lib/session";
import { requireAuth } from "../../middleware/auth";
import { authLimiter } from "../../middleware/security";

export const authRouter = Router();

// Compared against when the email is unknown, so a miss costs the same time as a hit.
const DUMMY_HASH = bcrypt.hashSync("pickova-timing-equaliser", BCRYPT_ROUNDS);

const userSelect = { id: true, email: true, firstName: true, lastName: true, phone: true, role: true } as const;

authRouter.post("/auth/register", authLimiter, async (req, res) => {
  const input = parse(registerSchema, req.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) throw conflict("An account with this email already exists. Try signing in instead.");

  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      lastLoginAt: new Date(),
      // role is never taken from the request: every sign-up is a CUSTOMER.
    },
    select: { ...userSelect, tokenVersion: true },
  });

  const { tokenVersion, ...dto } = user;
  setSessionCookie(res, await signSession({ sub: user.id, role: user.role, tv: tokenVersion }));
  res.status(201).json({ user: dto satisfies UserDTO });
});

authRouter.post("/auth/login", authLimiter, async (req, res) => {
  const input = parse(loginSchema, req.body);
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...userSelect, passwordHash: true, isActive: true, tokenVersion: true },
  });
  const passwordOk = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  // One message for every failure, so the form can't confirm which emails exist.
  if (!user || !passwordOk || !user.isActive) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const { passwordHash: _p, isActive: _a, tokenVersion, ...dto } = user;
  setSessionCookie(res, await signSession({ sub: user.id, role: user.role, tv: tokenVersion }));
  res.json({ user: dto satisfies UserDTO });
});

authRouter.post("/auth/forgot-password", authLimiter, async (req, res) => {
  const { email } = parse(forgotPasswordSchema, req.body);
  const token = await createPasswordReset(email);
  // Not awaited: the response must take the same time whether or not the account exists.
  if (token) void sendPasswordResetEmail(email, token);
  // Identical response either way, so this cannot be used to discover who has an account.
  res.json({ ok: true });
});

authRouter.post("/auth/reset-password", authLimiter, async (req, res) => {
  const { token, password } = parse(resetPasswordSchema, req.body);
  await resetPassword(token, password);
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.post("/auth/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/auth/me", requireAuth, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ user: req.user });
});
