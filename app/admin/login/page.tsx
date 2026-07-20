import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default async function AdminLoginPage() {
  // Already signed in → straight to the dashboard.
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="font-display text-xl font-extrabold text-brand-green">
              Admin Console
            </h1>
            <p className="text-sm text-brand-muted">Sign in to manage Pickova</p>
          </div>
        </div>
        <div className="rounded-card border border-brand-line-2 bg-white p-6 shadow-[0_10px_30px_rgba(10,61,38,0.08)]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
