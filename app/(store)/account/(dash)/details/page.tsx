import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/customer-auth";
import { ProfileForm, PasswordForm } from "../AccountForms";

export const metadata: Metadata = { title: "Account details" };
export const dynamic = "force-dynamic";

export default async function AccountDetailsPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="mb-4 font-display text-lg font-extrabold text-brand-green">
          Account details
        </h2>
        <ProfileForm name={customer.name} email={customer.email} />
      </div>
      <div>
        <h2 className="mb-4 font-display text-lg font-extrabold text-brand-green">
          Change password
        </h2>
        <PasswordForm />
      </div>
    </div>
  );
}
