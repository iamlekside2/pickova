"use client";

import { ArrowRight, CheckCircle2, Gift } from "lucide-react";
import { useState, type FormEvent } from "react";
import { newsletterSchema } from "@pickova/shared";
import { ApiRequestError, api } from "@/lib/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError(null);
    setState("sending");
    try {
      await api("/newsletter", { method: "POST", body: parsed.data });
      setState("done");
      setEmail("");
    } catch (err) {
      setState("idle");
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading" className="container-page">
      <div className="relative isolate grid items-center gap-6 overflow-hidden rounded-[1.75rem] bg-navy px-6 py-9 text-white sm:px-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="absolute -bottom-28 -right-20 -z-10 size-72 rounded-full bg-orange" aria-hidden />
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-orange text-white shadow-glow">
            <Gift className="size-7" aria-hidden />
          </span>
          <div>
            <h2 id="newsletter-heading" className="text-2xl text-white">Join the Pickova Family</h2>
            <p className="mt-1 text-sm text-white/75">Get new arrivals, restocks and deals in your inbox.</p>
          </div>
        </div>

        {state === "done" ? (
          <p role="status" className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3.5 text-sm font-medium">
            <CheckCircle2 className="size-5 shrink-0 text-orange" aria-hidden />
            You&apos;re in! Watch your inbox for the next drop.
          </p>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-2 rounded-[1.75rem] bg-white p-1.5 sm:flex-row sm:rounded-full">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "newsletter-error" : undefined}
                className="min-h-11 flex-1 rounded-full bg-transparent px-5 text-sm text-navy placeholder:text-navy-300 focus:outline-none focus-visible:ring-0"
              />
              <button type="submit" disabled={state === "sending"} className="btn-primary shadow-none">
                {state === "sending" ? "Subscribing…" : "Subscribe"} <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            {error && (
              <p id="newsletter-error" role="alert" className="mt-2 pl-5 text-sm text-orange-200">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
