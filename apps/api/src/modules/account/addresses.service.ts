import type { z } from "zod";
import type { AddressDTO, addressSchema } from "@pickova/shared";
import { HttpError, notFound } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

type AddressData = z.output<typeof addressSchema>;

const MAX_ADDRESSES = 10;
const select = { id: true, label: true, recipientName: true, phone: true, state: true, city: true, line1: true, instructions: true, isDefault: true } as const;

export function listAddresses(userId: string): Promise<AddressDTO[]> {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], select });
}

export async function createAddress(userId: string, input: AddressData): Promise<AddressDTO> {
  return prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) throw new HttpError(409, "LIMIT_REACHED", `You can save up to ${MAX_ADDRESSES} addresses. Remove one to add another.`);
    // The first address is always the default; otherwise only when asked.
    const isDefault = count === 0 || input.isDefault === true;
    if (isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.create({ data: { ...input, instructions: input.instructions ?? null, isDefault, userId }, select });
  });
}

export async function updateAddress(userId: string, id: string, input: AddressData): Promise<AddressDTO> {
  return prisma.$transaction(async (tx) => {
    // Ownership check: the address must belong to this customer.
    const existing = await tx.address.findFirst({ where: { id, userId }, select: { isDefault: true } });
    if (!existing) throw notFound("We couldn't find that address.");
    // A default address stays the default unless another one is chosen.
    const isDefault = input.isDefault === true || existing.isDefault;
    if (isDefault && !existing.isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: { ...input, instructions: input.instructions ?? null, isDefault }, select });
  });
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id, userId }, select: { isDefault: true } });
    if (!existing) throw notFound("We couldn't find that address.");
    await tx.address.delete({ where: { id } });
    if (existing.isDefault) {
      // Promote the oldest remaining address so there is always a default.
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "asc" }, select: { id: true } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
}
