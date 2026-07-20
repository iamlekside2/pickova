"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Bell, ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter, type SubscribeState } from "@/app/(store)/newsletter-actions";

function SubscribeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-gold px-6 py-3 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-gold-hover disabled:opacity-60"
    >
      {pending ? "Subscribing…" : "Subscribe"}
      <ArrowRight size={16} />
    </button>
  );
}

/**
 * Standalone newsletter block used on the homepage. Persists subscribers to the
 * database via a server action.
 */
export function Newsletter() {
  const [state, formAction] = useFormState(subscribeNewsletter, {} as SubscribeState);

  return (
    <section className="mx-auto max-w-content px-6 pt-12">
      <div className="rounded-card bg-brand-green px-6 py-10 text-center text-white sm:px-12">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Bell size={24} className="text-brand-gold" />
          <h2 className="m-0 font-display text-[26px] font-extrabold">
            No miss the next drop
          </h2>
        </div>
        <p className="mx-auto mb-6 max-w-md text-white/75">
          Drop your email, we go gist you when new season land — deals, drops, and early
          access.
        </p>

        {state.ok ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-semibold text-brand-gold">
            <Check size={18} />
            You dey inside now — check your inbox.
          </div>
        ) : (
          <form
            action={formAction}
            className="mx-auto flex max-w-md flex-col gap-2.5 sm:flex-row"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@email.com"
              className="flex-1 rounded-lg border-none px-4 py-3 text-sm text-brand-ink outline-none"
            />
            <SubscribeButton />
          </form>
        )}
        {state.error && (
          <p className="mt-3 text-sm font-medium text-brand-gold">{state.error}</p>
        )}
      </div>
    </section>
  );
}
