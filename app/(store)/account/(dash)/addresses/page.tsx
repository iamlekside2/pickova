import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";
import { AddressForm } from "../AccountForms";

export const metadata: Metadata = { title: "Addresses" };
export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const session = await getCustomer();
  if (!session) redirect("/account/login");
  const customer = await prisma.customer.findUnique({ where: { id: session.id } });

  return (
    <div>
      <h2 className="mb-1 font-display text-lg font-extrabold text-brand-green">Addresses</h2>
      <p className="mb-4 text-sm text-brand-muted">
        This address is used to deliver your orders.
      </p>
      <AddressForm phone={customer?.phone ?? ""} address={customer?.address ?? ""} />
    </div>
  );
}
