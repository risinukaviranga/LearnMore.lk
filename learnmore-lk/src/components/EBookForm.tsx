"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import type { FormState } from "@/lib/types";
import { SUBJECTS } from "@/lib/constants";
import { Field, SubmitButton } from "./forms";

type Initial = {
  id: string;
  title: string;
  author: string;
  subject: string;
  price: number;
  description: string;
  fileUrl: string;
};

export default function EBookForm({
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
      <Field label="Title" name="title" required minLength={3} maxLength={120} defaultValue={initial?.title} errors={e.title} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Author" name="author" required minLength={2} maxLength={80} defaultValue={initial?.author} errors={e.author} />
        <Field label="Subject" name="subject" as="select" required defaultValue={initial?.subject ?? SUBJECTS[0]} errors={e.subject}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Field>
      </div>
      <Field label="Price (LKR)" name="price" type="number" required min={0} max={1000000} defaultValue={initial?.price ?? 0} hint="Use 0 for a free e-book." errors={e.price} />
      <Field label="Description" name="description" as="textarea" required minLength={10} maxLength={2000} defaultValue={initial?.description} errors={e.description} />
      <Field label="PDF file URL" name="fileUrl" type="url" required defaultValue={initial?.fileUrl} hint="Link to the PDF stored in S3 / Cloudflare R2 (https://…)." errors={e.fileUrl} />
      <div className="flex gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/ebooks" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
