"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { login, register } from "@/actions/auth";
import type { FormState } from "@/lib/types";
import { Field, SubmitButton } from "./forms";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(login, {} as FormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4">
      <h1 className="h1">Login</h1>
      {state.error && <div className="alert-error">{state.error}</div>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" name="email" type="email" required errors={e.email} />
      <Field label="Password" name="password" type="password" required errors={e.password} />
      <SubmitButton>Login</SubmitButton>
      <p className="text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useFormState(register, {} as FormState);
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4">
      <h1 className="h1">Create your account</h1>
      {state.error && <div className="alert-error">{state.error}</div>}
      <Field label="Full name" name="name" required minLength={2} maxLength={60} errors={e.name} />
      <Field label="Email" name="email" type="email" required errors={e.email} />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        minLength={8}
        hint="At least 8 characters, with a letter and a number."
        errors={e.password}
      />
      <Field label="Confirm password" name="confirm" type="password" required errors={e.confirm} />
      <Field label="I am a" name="role" as="select" required defaultValue="STUDENT" errors={e.role}>
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
      </Field>
      <SubmitButton>Register</SubmitButton>
      <p className="text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
