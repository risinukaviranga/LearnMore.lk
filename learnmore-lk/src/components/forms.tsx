"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  children?: ReactNode;
  type?: string;
  as?: "input" | "textarea" | "select";
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  rows?: number;
};

export function Field(p: FieldProps) {
  const cls = "input" + (p.errors?.length ? " input-error" : "");
  const common = {
    id: p.name,
    name: p.name,
    required: p.required,
    defaultValue: p.defaultValue,
    className: cls,
    "aria-invalid": !!p.errors?.length,
  };

  return (
    <div>
      <label htmlFor={p.name} className="label">
        {p.label}
        {p.required && <span className="text-red-500"> *</span>}
      </label>
      {p.as === "textarea" ? (
        <textarea
          {...common}
          rows={p.rows ?? 4}
          placeholder={p.placeholder}
          minLength={p.minLength}
          maxLength={p.maxLength}
        />
      ) : p.as === "select" ? (
        <select {...common}>{p.children}</select>
      ) : (
        <input
          {...common}
          type={p.type ?? "text"}
          placeholder={p.placeholder}
          min={p.min}
          max={p.max}
          minLength={p.minLength}
          maxLength={p.maxLength}
        />
      )}
      {p.hint && !p.errors?.length && <p className="mt-1 text-xs text-slate-500">{p.hint}</p>}
      {p.errors?.map((e) => (
        <p key={e} className="field-error">
          {e}
        </p>
      ))}
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Please wait…" : children}
    </button>
  );
}
