import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Forgot Password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="card mx-auto max-w-md p-7 sm:p-9">
        <h1 className="text-3xl">Forgot your password?</h1>
        <p className="mb-7 mt-2 text-navy-400">Enter your email and we&apos;ll send you a link to choose a new one.</p>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
