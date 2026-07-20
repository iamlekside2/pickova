import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getCustomer();
  const customer = session
    ? await prisma.customer.findUnique({ where: { id: session.id } })
    : null;

  const defaults = customer
    ? {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-narrow px-6 py-10">
      <h1 className="mb-6 font-display text-3xl font-extrabold text-brand-green">
        Checkout
      </h1>
      {!session && (
        <p className="mb-5 text-sm text-brand-muted">
          Checking out as a guest.{" "}
          <Link href="/account/login" className="font-bold text-brand-green hover:underline">
            Sign in
          </Link>{" "}
          to save your details and track orders.
        </p>
      )}
      <CheckoutForm defaults={defaults} />
    </div>
  );
}
