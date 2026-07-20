"use client";

import { useFormState, useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "../actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      <LogIn size={18} />
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-brand-ink">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="admin@pickova.com.ng"
          className="rounded-lg border border-brand-line-2 bg-white px-3.5 py-3 text-sm text-brand-ink outline-none focus:border-brand-green"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-brand-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="rounded-lg border border-brand-line-2 bg-white px-3.5 py-3 text-sm text-brand-ink outline-none focus:border-brand-green"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
