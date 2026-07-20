// Customer (shopper) auth — separate from admin. Uses its own cookie
// (`pickova_customer`) and a `customer` role claim so the two never cross.

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signToken, verifyToken, SESSION_MAX_AGE, type SessionUser } from "./session";

const CUSTOMER_COOKIE = "pickova_customer";

export type CustomerSession = { id: string; email: string; name: string };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createCustomerSession(user: CustomerSession): Promise<void> {
  const token = await signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "customer",
  } as SessionUser);
  cookies().set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getCustomer(): Promise<CustomerSession | null> {
  const token = cookies().get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const user = await verifyToken(token);
  if (!user || user.role !== "customer") return null;
  return { id: user.id, email: user.email, name: user.name };
}

export function clearCustomerSession(): void {
  cookies().delete(CUSTOMER_COOKIE);
}
