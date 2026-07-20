import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/customer-auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const dynamic = "force-dynamic";

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();
  if (!customer) redirect("/account/login");

  return (
    <div className="mx-auto max-w-content px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-extrabold text-brand-green">
        My account
      </h1>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
