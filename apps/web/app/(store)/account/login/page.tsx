import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Sign In", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="card mx-auto max-w-md p-7 sm:p-9">
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mb-7 mt-2 text-navy-400">Sign in to your Pickova account.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
