"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";
import type { SupplierFormState } from "./actions";

export type SupplierInitial = {
  name: string;
  contactEmail: string;
  contactPhone: string;
  adapterKey: string;
  apiBaseUrl: string;
  leadTimeDays: number;
  status: string;
};

type Props = {
  action: (prev: SupplierFormState, fd: FormData) => Promise<SupplierFormState>;
  initial?: SupplierInitial;
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

export function SupplierForm({ action, initial, submitLabel = "Save supplier" }: Props) {
  const [state, formAction] = useFormState(action, {} as SupplierFormState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Supplier name *</span>
        <input name="name" required defaultValue={initial?.name} className={inputCls} placeholder="e.g. Lagos Gadgets Ltd" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Contact email</span>
          <input name="contactEmail" type="email" defaultValue={initial?.contactEmail} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Contact phone</span>
          <input name="contactPhone" defaultValue={initial?.contactPhone} className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Fulfilment adapter</span>
          <select name="adapterKey" defaultValue={initial?.adapterKey ?? "manual"} className={inputCls}>
            <option value="manual">Manual (admin places orders)</option>
            <option value="generic-rest">Generic REST API (auto-forward)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Lead time (days)</span>
          <input name="leadTimeDays" type="number" min={0} defaultValue={initial?.leadTimeDays ?? 3} className={inputCls} />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>API base URL (for auto-forward)</span>
          <input name="apiBaseUrl" defaultValue={initial?.apiBaseUrl} className={inputCls} placeholder="https://api.supplier.com" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Status</span>
          <select name="status" defaultValue={initial?.status ?? "active"} className={inputCls}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/suppliers" className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          Cancel
        </Link>
      </div>
    </form>
  );
}
