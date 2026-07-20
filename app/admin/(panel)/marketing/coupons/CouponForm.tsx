"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";
import type { CouponFormState } from "./actions";

export type CouponInitial = {
  code: string;
  type: string;
  value: number;
  active: boolean;
  usageLimit: number;
  expiresAt: string; // yyyy-mm-dd or ""
};

type Props = {
  action: (prev: CouponFormState, fd: FormData) => Promise<CouponFormState>;
  initial?: CouponInitial;
  submitLabel?: string;
};

const labelCls = "text-[13px] font-bold text-brand-ink";
const inputCls =
  "rounded-lg border border-brand-line-2 bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-green";

function SubmitButton({ label }: { label: string }) {
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

export function CouponForm({ action, initial, submitLabel = "Save coupon" }: Props) {
  const [state, formAction] = useFormState(action, {} as CouponFormState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Code *</span>
        <input name="code" required defaultValue={initial?.code} className={`${inputCls} uppercase`} placeholder="WELCOME10" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Type</span>
          <select name="type" defaultValue={initial?.type ?? "percent"} className={inputCls}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed (₦)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Value</span>
          <input name="value" type="number" min={1} required defaultValue={initial?.value} className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Usage limit (0 = unlimited)</span>
          <input name="usageLimit" type="number" min={0} defaultValue={initial?.usageLimit ?? 0} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Expires (optional)</span>
          <input name="expiresAt" type="date" defaultValue={initial?.expiresAt} className={inputCls} />
        </label>
      </div>

      <label className="flex items-center gap-2.5">
        <input name="active" type="checkbox" defaultChecked={initial ? initial.active : true} className="h-4 w-4 accent-brand-green" />
        <span className={labelCls}>Active</span>
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/marketing/coupons" className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          Cancel
        </Link>
      </div>
    </form>
  );
}
