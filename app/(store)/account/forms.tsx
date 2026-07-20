"use client";

import { useFormState, useFormStatus } from "react-dom";
import { LogIn, UserPlus } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "./actions";

const labelCls = "text-[13px] font-bold text-brand-ink";
const inputCls =
  "rounded-lg border border-brand-line-2 bg-white px-3.5 py-3 text-sm text-brand-ink outline-none focus:border-brand-green";

function SubmitButton({ label, icon }: { label: string; icon: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      {icon}
      {pending ? "Please wait…" : label}
    </button>
  );
}

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
      {error}
    </div>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, {} as AuthState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <ErrorBox error={state.error} />
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Password</span>
        <input name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className={inputCls} />
      </label>
      <SubmitButton label="Sign in" icon={<LogIn size={18} />} />
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, {} as AuthState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <ErrorBox error={state.error} />
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Full name</span>
        <input name="name" required autoComplete="name" placeholder="Chidinma Okafor" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Password</span>
        <input name="password" type="password" required autoComplete="new-password" placeholder="At least 6 characters" className={inputCls} />
      </label>
      <SubmitButton label="Create account" icon={<UserPlus size={18} />} />
    </form>
  );
}
