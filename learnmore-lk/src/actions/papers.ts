"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { paperSchema, zodState } from "@/lib/validation";
import type { FormState } from "@/lib/types";

export async function createPaper(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const parsed = paperSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  const { markingSchemeUrl, ...rest } = parsed.data;
  const paper = await prisma.paper.create({
    data: { ...rest, markingSchemeUrl: markingSchemeUrl || null, uploaderId: s.userId },
  });
  redirect(`/papers/${paper.id}?msg=created`);
}

export async function updatePaper(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.paper.findUnique({ where: { id } });
  if (!existing) return { error: "This paper no longer exists." };
  if (s.role !== "ADMIN" && existing.uploaderId !== s.userId) {
    return { error: "You can only edit papers you uploaded." };
  }

  const parsed = paperSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  const { markingSchemeUrl, ...rest } = parsed.data;
  await prisma.paper.update({
    where: { id },
    data: { ...rest, markingSchemeUrl: markingSchemeUrl || null },
  });
  redirect(`/papers/${id}?msg=updated`);
}

export async function deletePaper(fd: FormData) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.paper.findUnique({ where: { id } });
  if (!existing) redirect("/papers?err=notfound");
  if (s.role !== "ADMIN" && existing.uploaderId !== s.userId) redirect("/papers?err=forbidden");

  await prisma.paper.delete({ where: { id } });
  redirect("/papers?msg=deleted");
}
