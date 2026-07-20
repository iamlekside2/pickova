"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";
import { ICON_NAMES } from "@/lib/icons";
import type { CategoryFormState } from "./actions";

export type CategoryInitial = {
  name: string;
  icon: string;
  blurb: string;
  sortOrder: number;
};

type Props = {
  action: (prev: CategoryFormState, fd: FormData) => Promise<CategoryFormState>;
  initial?: CategoryInitial;
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

export function CategoryForm({ action, initial, submitLabel = "Save category" }: Props) {
  const [state, formAction] = useFormState(action, {} as CategoryFormState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Name *</span>
        <input name="name" required defaultValue={initial?.name} className={inputCls} placeholder="e.g. Electronics" />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Icon</span>
          <select name="icon" defaultValue={initial?.icon ?? "Flame"} className={inputCls}>
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Sort order</span>
          <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className={inputCls} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Blurb</span>
        <input name="blurb" defaultValue={initial?.blurb} className={inputCls} placeholder="Short buyer-facing description" />
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/categories" className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          Cancel
        </Link>
      </div>
    </form>
  );
}
