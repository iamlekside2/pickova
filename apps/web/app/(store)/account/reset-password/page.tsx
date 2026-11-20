import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/account/AuthForms";

// "no-referrer" keeps the one-time token in the URL from leaking to other sites.
export const metadata: Metadata = { title: "Reset Password", robots: { index: false }, referrer: "no-referrer" };

export default function ResetPasswordPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="card mx-auto max-w-md p-7 sm:p-9">
        <h1 className="text-3xl">Choose a new password</h1>
        <p className="mb-7 mt-2 text-navy-400">You&apos;ll be signed out everywhere and can sign in again with the new password.</p>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
