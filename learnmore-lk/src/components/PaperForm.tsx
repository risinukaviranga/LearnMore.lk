"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { FormState } from "@/lib/types";
import { GRADES, SUBJECTS, TERMS } from "@/lib/constants";
import { Field, SubmitButton } from "./forms";

type Initial = {
  id: string;
  title: string;
  subject: string;
  grade: number;
  year: number;
  term: number;
  isPremium: boolean;
  fileUrl: string;
  markingSchemeUrl: string | null;
};

export default function PaperForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Initial;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as FormState);
  const e = state.fieldErrors ?? {};
  const thisYear = new Date().getFullYear();

  return (
    <form action={formAction} className="card max-w-2xl space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <div className="alert-error">{state.error}</div>}
      <Field label="Title" name="title" required minLength={3} maxLength={120} defaultValue={initial?.title} errors={e.title} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subject" name="subject" as="select" required defaultValue={initial?.subject ?? SUBJECTS[0]} errors={e.subject}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Field>
        <Field label="Grade" name="grade" as="select" required defaultValue={initial?.grade ?? 11} errors={e.grade}>
          {GRADES.map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </Field>
        <Field label="Year" name="year" type="number" required min={2000} max={thisYear + 1} defaultValue={initial?.year ?? thisYear} errors={e.year} />
        <Field label="Term" name="term" as="select" required defaultValue={initial?.term ?? 1} errors={e.term}>
          {TERMS.map((t) => (
            <option key={t} value={t}>Term {t}</option>
          ))}
        </Field>
      </div>
      <Field label="Paper PDF URL" name="fileUrl" type="url" required defaultValue={initial?.fileUrl} errors={e.fileUrl} />
      <Field label="Marking scheme URL (optional)" name="markingSchemeUrl" type="url" defaultValue={initial?.markingSchemeUrl ?? ""} errors={e.markingSchemeUrl} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPremium" defaultChecked={initial?.isPremium} className="h-4 w-4" />
        Premium paper (only visible to logged-in users)
      </label>
      <div className="flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/papers" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
