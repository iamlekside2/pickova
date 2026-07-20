"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createCustomerSession,
  clearCustomerSession,
} from "@/lib/customer-auth";

export type AuthState = { error?: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Enter your name." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing && existing.passwordHash) {
    return { error: "An account with that email already exists. Please sign in." };
  }

  const passwordHash = await hashPassword(password);
  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { name, passwordHash },
      })
    : await prisma.customer.create({ data: { name, email, passwordHash } });

  await createCustomerSession({ id: customer.id, email: customer.email, name: customer.name });
  redirect("/account");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash || !(await verifyPassword(password, customer.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createCustomerSession({ id: customer.id, email: customer.email, name: customer.name });
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  clearCustomerSession();
  redirect("/");
}
