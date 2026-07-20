"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  getCustomer,
  createCustomerSession,
  hashPassword,
  verifyPassword,
} from "@/lib/customer-auth";

export type AccountState = { ok?: boolean; error?: string };

export async function updateProfile(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getCustomer();
  if (!session) return { error: "Please sign in again." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name can't be empty." };

  const updated = await prisma.customer.update({
    where: { id: session.id },
    data: { name },
  });
  // Refresh the session so the greeting/name updates everywhere.
  await createCustomerSession({ id: updated.id, email: updated.email, name: updated.name });

  revalidatePath("/account");
  revalidatePath("/account/details");
  return { ok: true };
}

export async function updateAddress(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getCustomer();
  if (!session) return { error: "Please sign in again." };

  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  await prisma.customer.update({
    where: { id: session.id },
    data: { phone, address },
  });

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function changePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const session = await getCustomer();
  if (!session) return { error: "Please sign in again." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 6) return { error: "New password must be at least 6 characters." };
  if (next !== confirm) return { error: "New passwords don't match." };

  const customer = await prisma.customer.findUnique({ where: { id: session.id } });
  if (!customer?.passwordHash || !(await verifyPassword(current, customer.passwordHash))) {
    return { error: "Your current password is incorrect." };
  }

  await prisma.customer.update({
    where: { id: session.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { ok: true };
}
