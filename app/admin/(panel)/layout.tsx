import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth — middleware already guards /admin, but never render the
  // panel without a verified session.
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return <AdminShell user={session}>{children}</AdminShell>;
}
