"use client";

import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

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
