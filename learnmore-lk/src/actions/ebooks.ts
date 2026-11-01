"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ebookSchema, zodState } from "@/lib/validation";
import type { FormState } from "@/lib/types";

export async function createEBook(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const parsed = ebookSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  const ebook = await prisma.eBook.create({ data: { ...parsed.data, createdById: s.userId } });
  redirect(`/ebooks/${ebook.id}?msg=created`);
}

export async function updateEBook(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.eBook.findUnique({ where: { id } });
  if (!existing) return { error: "This e-book no longer exists." };
  if (s.role !== "ADMIN" && existing.createdById !== s.userId) {
    return { error: "You can only edit your own e-books." };
  }

  const parsed = ebookSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  await prisma.eBook.update({ where: { id }, data: parsed.data });
  redirect(`/ebooks/${id}?msg=updated`);
}

export async function deleteEBook(fd: FormData) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.eBook.findUnique({ where: { id } });
  if (!existing) redirect("/ebooks?err=notfound");
  if (s.role !== "ADMIN" && existing.createdById !== s.userId) redirect("/ebooks?err=forbidden");

  // Safe delete: never remove a book that students have already purchased.
  const purchases = await prisma.orderItem.count({ where: { ebookId: id } });
  if (purchases > 0) redirect("/ebooks?err=in-use");

  await prisma.eBook.delete({ where: { id } });
  redirect("/ebooks?msg=deleted");
}
