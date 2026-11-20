"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type UserDTO,
} from "@pickova/shared";
import { Field, FormError, useServerErrors } from "@/components/ui/Form";
import { api } from "@/lib/api";
import { safeNext } from "@/lib/use-api";
import { useCart } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { useWishlist } from "@/stores/wishlist";

const PASSWORD_HINT = "At least 8 characters, with a letter and a number.";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const { formError, setFormError, handle } = useServerErrors<LoginInput>(setError);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await api<{ user: UserDTO }>("/auth/login", { method: "POST", body: values });
      useSession.getState().setUser(user);
      router.push(safeNext(next));
      router.refresh();
    } catch (e) {
      handle(e);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {params.get("reset") === "1" && (
        <p role="status" className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">Your password has been changed. Sign in with your new password.</p>
      )}
      <FormError message={formError} />
      <Field name="email" label="Email address" type="email" autoComplete="email" register={register} errors={errors} />
      <div>
        <Field name="password" label="Password" type="password" autoComplete="current-password" register={register} errors={errors} />
        <p className="mt-2 text-right text-sm">
          <Link href="/account/forgot-password" className="rounded font-medium text-orange-700 underline underline-offset-2">Forgot your password?</Link>
        </p>
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-base">
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-sm text-navy-400">
        New to Pickova?{" "}
        <Link href={next ? `/account/register?next=${encodeURIComponent(next)}` : "/account/register"} className="rounded font-medium text-orange-700 underline underline-offset-2">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const { formError, setFormError, handle } = useServerErrors<RegisterInput>(setError);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user } = await api<{ user: UserDTO }>("/auth/register", { method: "POST", body: values });
      useSession.getState().setUser(user);
      router.push(safeNext(next));
      router.refresh();
    } catch (e) {
      handle(e);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label="First name" autoComplete="given-name" register={register} errors={errors} />
        <Field name="lastName" label="Last name" autoComplete="family-name" register={register} errors={errors} />
      </div>
      <Field name="email" label="Email address" type="email" autoComplete="email" register={register} errors={errors} />
      <Field name="phone" label="Phone number (optional)" type="tel" autoComplete="tel" placeholder="0803 000 0000" register={register} errors={errors} />
      <Field name="password" label="Password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} register={register} errors={errors} />
      <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-base">
        {isSubmitting ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-center text-xs leading-relaxed text-navy-400">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="rounded underline underline-offset-2">Terms</Link> and{" "}
        <Link href="/privacy" className="rounded underline underline-offset-2">Privacy Policy</Link>.
      </p>
      <p className="text-center text-sm text-navy-400">
        Already have an account?{" "}
        <Link href={next ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login"} className="rounded font-medium text-orange-700 underline underline-offset-2">Sign in</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const { formError, setFormError, handle } = useServerErrors<ForgotPasswordInput>(setError);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api("/auth/forgot-password", { method: "POST", body: values });
      setSentTo(values.email);
    } catch (e) {
      handle(e);
    }
  });

  if (sentTo) {
    return (
      <div role="status" className="text-center">
        <MailCheck className="mx-auto size-12 text-orange" aria-hidden />
        <h2 className="mt-4 text-xl">Check your email</h2>
        <p className="mt-2 text-sm leading-relaxed text-navy-400">
          If an account exists for <span className="font-medium text-navy">{sentTo}</span>, we&apos;ve sent a link to reset your password. It is valid for 30 minutes.
        </p>
        <Link href="/account/login" className="btn-outline mt-6">Back to sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      <Field name="email" label="Email address" type="email" autoComplete="email" register={register} errors={errors} />
      <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-base">
        {isSubmitting ? "Sending…" : "Send Reset Link"}
      </button>
      <p className="text-center text-sm">
        <Link href="/account/login" className="rounded font-medium text-orange-700 underline underline-offset-2">Back to sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });
  const { formError, setFormError, handle } = useServerErrors<ResetPasswordInput>(setError);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api("/auth/reset-password", { method: "POST", body: values });
      // The reset signed every device out, so drop this device's copy of account data too.
      useSession.getState().setUser(null);
      useCart.getState().clear();
      useWishlist.setState({ items: [] });
      router.push("/account/login?reset=1");
    } catch (e) {
      handle(e);
    }
  });

  if (!token || errors.token) {
    return (
      <div role="alert" className="text-center">
        <p className="text-navy-500">This reset link is invalid or incomplete. Please request a new one.</p>
        <Link href="/account/forgot-password" className="btn-primary mt-6">Request a new link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <FormError message={formError} />
      {formError && (
        <p className="text-sm">
          <Link href="/account/forgot-password" className="rounded font-medium text-orange-700 underline underline-offset-2">Request a new link</Link>
        </p>
      )}
      <input type="hidden" {...register("token")} />
      <Field name="password" label="New password" type="password" autoComplete="new-password" hint={PASSWORD_HINT} register={register} errors={errors} />
      <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-base">
        {isSubmitting ? "Saving…" : "Set New Password"}
      </button>
    </form>
  );
}
