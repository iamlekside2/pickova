"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Check } from "lucide-react";
import { saveSettings, type SettingsState } from "./actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 rounded-lg bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-green-dark disabled:opacity-60"
    >
      <Save size={16} />
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export function SettingsForm({ defaultMarkup }: { defaultMarkup: number }) {
  const [state, formAction] = useFormState(saveSettings, {} as SettingsState);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3.5 py-2.5 text-sm font-medium text-brand-danger">
          {state.error}
        </div>
      )}
      {state.ok && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-green/30 bg-brand-green/5 px-3.5 py-2.5 text-sm font-medium text-brand-green">
          <Check size={16} /> Saved.
        </div>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold text-brand-ink">Default markup (%)</span>
        <input
          name="defaultMarkup"
          type="number"
          min={0}
          defaultValue={defaultMarkup}
          className="rounded-lg border border-brand-line-2 bg-white px-3.5 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-green"
        />
        <span className="text-xs text-brand-muted-2">
          Applied to new &amp; imported products (sell price = cost × (1 + markup%)).
          You can override it per product.
        </span>
      </label>
      <div>
        <SaveButton />
      </div>
    </form>
  );
}
