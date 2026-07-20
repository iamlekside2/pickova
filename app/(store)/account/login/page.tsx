import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/customer-auth";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  if (await getCustomer()) redirect("/account");

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-brand-green">
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-brand-muted">Sign in to your Pickova account.</p>
      <div className="rounded-card border border-brand-line-2 bg-white p-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-sm text-brand-muted">
        New here?{" "}
        <Link href="/account/register" className="font-bold text-brand-green hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
