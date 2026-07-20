"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Save } from "lucide-react";
import { ICON_NAMES } from "@/lib/icons";
import type { CollectionFormState } from "./actions";

export type CollectionInitial = {
  name: string;
  slug: string;
  active: boolean;
  months: string; // comma-separated for the input
  emoji: string;
  icon: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage: string;
  themeFrom: string;
  themeTo: string;
};

type Props = {
  action: (prev: CollectionFormState, fd: FormData) => Promise<CollectionFormState>;
  initial?: CollectionInitial;
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

export function CollectionForm({ action, initial, submitLabel = "Save collection" }: Props) {
  const [state, formAction] = useFormState(action, {} as CollectionFormState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Name *</span>
          <input name="name" required defaultValue={initial?.name} className={inputCls} placeholder="e.g. Detty December" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Slug (optional)</span>
          <input name="slug" defaultValue={initial?.slug} className={inputCls} placeholder="auto from name" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Emoji</span>
          <input name="emoji" defaultValue={initial?.emoji} className={inputCls} placeholder="🎉" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Icon</span>
          <select name="icon" defaultValue={initial?.icon ?? "Flame"} className={inputCls}>
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Months (comma-separated, 1–12)</span>
          <input name="months" defaultValue={initial?.months} className={inputCls} placeholder="12  or  3,4" />
        </label>
        <label className="flex items-center gap-2.5 pt-6">
          <input name="active" type="checkbox" defaultChecked={initial?.active ?? false} className="h-4 w-4 accent-brand-green" />
          <span className={labelCls}>Active (in season)</span>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>Hero headline</span>
          <input name="heroHeadline" defaultValue={initial?.heroHeadline} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>Hero subtext</span>
          <textarea name="heroSubtext" rows={2} defaultValue={initial?.heroSubtext} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={labelCls}>Hero image URL</span>
          <input name="heroImage" defaultValue={initial?.heroImage} className={inputCls} placeholder="https://…" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Theme colour (from)</span>
          <input name="themeFrom" defaultValue={initial?.themeFrom ?? "#0A6640"} className={inputCls} placeholder="#0A6640" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Theme colour (to)</span>
          <input name="themeTo" defaultValue={initial?.themeTo ?? "#0d7a4d"} className={inputCls} placeholder="#0d7a4d" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link href="/admin/marketing/collections" className="text-sm font-semibold text-brand-muted hover:text-brand-green">
          Cancel
        </Link>
      </div>
    </form>
  );
}
