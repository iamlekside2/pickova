"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { changePasswordSchema, profileSchema, type ChangePasswordInput, type ProfileInput, type UserDTO } from "@pickova/shared";
import { Field, FormError, FormSuccess, useServerErrors } from "@/components/ui/Form";
import { api } from "@/lib/api";
import { useSession } from "@/stores/session";

function ProfileForm({ user }: { user: UserDTO }) {
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? "" },
  });
  const { formError, setFormError, handle } = useServerErrors<ProfileInput>(setError);
  const [saved, setSaved] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(null);
    try {
      const { user: updated } = await api<{ user: UserDTO }>("/account/profile", { method: "PATCH", body: values });
      useSession.getState().setUser(updated);
      reset({ firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone ?? "" });
      setSaved("Your details have been updated.");
    } catch (e) {
      handle(e);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6">
      <h2 className="text-xl">Your details</h2>
      <FormError message={formError} />
      <FormSuccess message={saved} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="firstName" label="First name" autoComplete="given-name" register={register} errors={errors} />
        <Field name="lastName" label="Last name" autoComplete="family-name" register={register} errors={errors} />
      </div>
      <Field name="phone" label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" register={register} errors={errors} />
      <div>
        <label htmlFor="profile-email" className="field-label">Email address</label>
        <input id="profile-email" value={user.email} readOnly aria-describedby="profile-email-hint" className="field-input cursor-not-allowed bg-offwhite text-navy-400" />
        <p id="profile-email-hint" className="mt-1.5 text-xs text-navy-400">Your email is your sign-in and can&apos;t be changed here. Contact us if you need to update it.</p>
      </div>
      <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
        {isSubmitting ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const { formError, setFormError, handle } = useServerErrors<ChangePasswordInput>(setError);
  const [saved, setSaved] = useState<string | null>(null);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setSaved(null);
    try {
      await api("/account/change-password", { method: "POST", body: values });
      reset();
      setSaved("Your password has been changed. Other devices have been signed out.");
    } catch (e) {
      handle(e);
    }
  });

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6">
      <h2 className="text-xl">Change password</h2>
      <FormError message={formError} />
      <FormSuccess message={saved} />
      <Field name="currentPassword" label="Current password" type="password" autoComplete="current-password" register={register} errors={errors} />
      <Field name="newPassword" label="New password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." register={register} errors={errors} />
      <button type="submit" disabled={isSubmitting} className="btn-navy">
        {isSubmitting ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const user = useSession((s) => s.user);
  const status = useSession((s) => s.status);
  const router = useRouter();
  // The session ended (or the cookie was stale): go and sign in again.
  useEffect(() => {
    if (status === "ready" && !user) router.replace("/account/login?next=/account/profile");
  }, [status, user, router]);

  return (
    <>
      <h1 className="text-3xl sm:text-4xl">Profile Settings</h1>
      <div className="mt-8 max-w-2xl space-y-6">
        {user ? (
          <>
            <ProfileForm key={user.id} user={user} />
            <PasswordForm />
          </>
        ) : (
          <div className="h-72 animate-pulse rounded-card bg-navy-50" aria-busy="true" aria-label="Loading your profile" />
        )}
      </div>
    </>
  );
}
