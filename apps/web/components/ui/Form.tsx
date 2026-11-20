"use client";

import { useState } from "react";
import type { FieldErrors, FieldValues, Path, UseFormRegister, UseFormSetError } from "react-hook-form";
import { ApiRequestError } from "@/lib/api";

type FieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

/** Labelled text input wired to react-hook-form, with an accessible error message. */
export function Field<T extends FieldValues>({ name, label, register, errors, hint, ...input }: FieldProps<T>) {
  const message = errors[name]?.message as string | undefined;
  const describedBy = message ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} {...input} {...register(name)} aria-invalid={message ? true : undefined} aria-describedby={describedBy} className="field-input" />
      {message ? (
        <p id={`${name}-error`} role="alert" className="field-error">{message}</p>
      ) : (
        hint && <p id={`${name}-hint`} className="mt-1.5 text-xs text-navy-400">{hint}</p>
      )}
    </div>
  );
}

/** Puts an API error on the form: per-field messages from a 422, otherwise one banner. */
export function useServerErrors<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [formError, setFormError] = useState<string | null>(null);
  function handle(e: unknown) {
    if (e instanceof ApiRequestError) {
      for (const [field, messages] of Object.entries(e.fields ?? {})) setError(field as Path<T>, { message: messages[0] });
      setFormError(e.fields ? null : e.message);
    } else setFormError("Something went wrong. Please try again.");
  }
  return { formError, setFormError, handle };
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{message}</p>;
}

export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="status" className="rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">{message}</p>;
}
