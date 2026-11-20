import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Create Account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="card mx-auto max-w-lg p-7 sm:p-9">
        <h1 className="text-3xl">Create your account</h1>
        <p className="mb-7 mt-2 text-navy-400">Save your details for faster checkout and order tracking.</p>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
