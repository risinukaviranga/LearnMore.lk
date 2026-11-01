"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { FormState } from "@/lib/types";
import { GRADES, SUBJECTS } from "@/lib/constants";
import { Field, SubmitButton } from "./forms";

type Initial = {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: number;
  startsAt: string; // "YYYY-MM-DDTHH:mm" in Sri Lanka time
  durationMin: number;
  meetingUrl: string;
};

export default function ClassForm({
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

  return (
    <form action={formAction} className="card max-w-2xl space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {state.error && <div className="alert-error">{state.error}</div>}
      <Field label="Class title" name="title" required minLength={3} maxLength={120} defaultValue={initial?.title} errors={e.title} />
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
        <Field label="Start (Sri Lanka time)" name="startsAt" type="datetime-local" required defaultValue={initial?.startsAt} errors={e.startsAt} />
        <Field label="Duration (minutes)" name="durationMin" type="number" required min={15} max={480} defaultValue={initial?.durationMin ?? 60} errors={e.durationMin} />
      </div>
      <Field label="Meeting link (Zoom / WebRTC room)" name="meetingUrl" type="url" required defaultValue={initial?.meetingUrl} placeholder="https://zoom.us/j/..." errors={e.meetingUrl} />
      <Field label="Description" name="description" as="textarea" required minLength={10} maxLength={2000} defaultValue={initial?.description} errors={e.description} />
      <div className="flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/classes" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
