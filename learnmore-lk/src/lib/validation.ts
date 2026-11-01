import { z, ZodError } from "zod";
import type { FormState } from "./types";
import { parseColombo } from "./format";

export function zodState(e: ZodError): FormState {
  return {
    error: "Please fix the highlighted fields.",
    fieldErrors: e.flatten().fieldErrors as Record<string, string[] | undefined>,
  };
}

const url = (label: string) => z.string().trim().url(`${label} must be a valid URL (https://...)`);
const optionalUrl = (label: string) => url(label).or(z.literal("")).optional();

const int = (label: string, min: number, max: number) =>
  z.coerce
    .number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(max, `${label} must be at most ${max}`);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirm: z.string(),
    role: z.enum(["STUDENT", "INSTRUCTOR"], { errorMap: () => ({ message: "Choose a role" }) }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ebookSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
  author: z.string().trim().min(2, "Author must be at least 2 characters").max(80, "Author is too long"),
  subject: z.string().trim().min(2, "Subject is required"),
  price: int("Price", 0, 1_000_000),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  fileUrl: url("File URL"),
});

export const paperSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
  subject: z.string().trim().min(2, "Subject is required"),
  grade: int("Grade", 1, 13),
  year: int("Year", 2000, new Date().getFullYear() + 1),
  term: int("Term", 1, 3),
  isPremium: z.preprocess((v) => v === "on", z.boolean()),
  fileUrl: url("Paper file URL"),
  markingSchemeUrl: optionalUrl("Marking scheme URL"),
});

export const classSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120, "Title is too long"),
  subject: z.string().trim().min(2, "Subject is required"),
  grade: int("Grade", 1, 13),
  startsAt: z
    .string()
    .min(1, "Start date & time is required")
    .refine((v) => !isNaN(parseColombo(v).getTime()), "Enter a valid date & time"),
  durationMin: int("Duration", 15, 480),
  meetingUrl: url("Meeting link"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
});
