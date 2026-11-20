"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import Link from "next/link";
import { useToasts } from "@/stores/toast";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-sm text-white shadow-card-hover"
        >
          {t.tone === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-orange" aria-hidden />
          ) : (
            <CircleAlert className="size-5 shrink-0 text-orange-300" aria-hidden />
          )}
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 font-medium text-orange-300 underline-offset-2 hover:underline">
              {t.action.label}
            </Link>
          )}
          <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 rounded-full p-1 text-white/70 hover:text-white" aria-label="Dismiss">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
