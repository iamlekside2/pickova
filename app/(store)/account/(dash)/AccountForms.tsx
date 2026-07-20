"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { updateProfile, updateAddress, changePassword, type AccountState } from "./actions";

const labelCls = "text-[13px] font-bold text-brand-ink";
const inputCls =
  "w-full rounded-lg border border-brand-line-2 bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-green disabled:bg-brand-bg disabled:text-brand-muted";

function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      <Save size={16} />
      {pending ? "Saving…" : label}
    </button>
  );
}

function Feedback({ state }: { state: AccountState }) {
  if (state.ok)
    return (
      <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 px-3.5 py-2.5 text-sm font-medium text-brand-green">
        Saved ✓
      </div>
    );
  if (state.error)
    return (
      <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
        {state.error}
      </div>
    );
  return null;
}

export function AddressForm({ phone, address }: { phone: string; address: string }) {
  const [state, formAction] = useFormState(updateAddress, {} as AccountState);
  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4 rounded-card border border-brand-line-2 bg-white p-6">
      <Feedback state={state} />
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Phone number</span>
        <input name="phone" defaultValue={phone} placeholder="080X XXX XXXX" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Delivery address</span>
        <textarea name="address" rows={3} defaultValue={address} placeholder="No. 4, Allen Avenue, Ikeja, Lagos" className={inputCls} />
      </label>
      <div><SaveButton label="Save address" /></div>
    </form>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction] = useFormState(updateProfile, {} as AccountState);
  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4 rounded-card border border-brand-line-2 bg-white p-6">
      <Feedback state={state} />
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Full name</span>
        <input name="name" required defaultValue={name} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Email</span>
        <input value={email} disabled className={inputCls} />
        <span className="text-xs text-brand-muted-2">Email is used to sign in and can&apos;t be changed here.</span>
      </label>
      <div><SaveButton /></div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, {} as AccountState);
  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4 rounded-card border border-brand-line-2 bg-white p-6">
      <Feedback state={state} />
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Current password</span>
        <input name="current" type="password" required autoComplete="current-password" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>New password</span>
        <input name="next" type="password" required autoComplete="new-password" placeholder="At least 6 characters" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Confirm new password</span>
        <input name="confirm" type="password" required autoComplete="new-password" className={inputCls} />
      </label>
      <div><SaveButton label="Change password" /></div>
    </form>
  );
}
