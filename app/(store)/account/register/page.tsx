import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/customer-auth";
import { RegisterForm } from "../forms";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage() {
  if (await getCustomer()) redirect("/account");

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-brand-green">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-brand-muted">
        Save your details and track your orders.
      </p>
      <div className="rounded-card border border-brand-line-2 bg-white p-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-sm text-brand-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-bold text-brand-green hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
