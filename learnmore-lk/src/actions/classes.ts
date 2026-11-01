"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { classSchema, zodState } from "@/lib/validation";
import { parseColombo } from "@/lib/format";
import type { FormState } from "@/lib/types";

export async function createClass(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const parsed = classSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  const startsAt = parseColombo(parsed.data.startsAt);
  if (startsAt.getTime() < Date.now()) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { startsAt: ["Start time must be in the future"] },
    };
  }

  const c = await prisma.classSession.create({
    data: { ...parsed.data, startsAt, instructorId: s.userId },
  });
  redirect(`/classes/${c.id}?msg=created`);
}

export async function updateClass(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.classSession.findUnique({ where: { id } });
  if (!existing) return { error: "This class no longer exists." };
  if (s.role !== "ADMIN" && existing.instructorId !== s.userId) {
    return { error: "You can only edit your own classes." };
  }

  const parsed = classSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodState(parsed.error);

  await prisma.classSession.update({
    where: { id },
    data: { ...parsed.data, startsAt: parseColombo(parsed.data.startsAt) },
  });
  redirect(`/classes/${id}?msg=updated`);
}

export async function deleteClass(fd: FormData) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const existing = await prisma.classSession.findUnique({ where: { id } });
  if (!existing) redirect("/classes?err=notfound");
  if (s.role !== "ADMIN" && existing.instructorId !== s.userId) redirect("/classes?err=forbidden");

  // Enrollments are removed automatically (onDelete: Cascade).
  await prisma.classSession.delete({ where: { id } });
  redirect("/classes?msg=deleted");
}

export async function enroll(fd: FormData) {
  const s = await requireUser();
  const id = String(fd.get("id") ?? "");
  const c = await prisma.classSession.findUnique({ where: { id } });
  if (!c) redirect("/classes?err=notfound");
  const end = c.startsAt.getTime() + c.durationMin * 60000;
  if (Date.now() > end) redirect(`/classes/${id}?err=past`);

  await prisma.enrollment.upsert({
    where: { userId_classId: { userId: s.userId, classId: id } },
    create: { userId: s.userId, classId: id },
    update: {},
  });
  redirect(`/classes/${id}?msg=enrolled`);
}

export async function unenroll(fd: FormData) {
  const s = await requireUser();
  const id = String(fd.get("id") ?? "");
  await prisma.enrollment.deleteMany({ where: { userId: s.userId, classId: id } });
  redirect(`/classes/${id}?msg=unenrolled`);
}

export async function checkIn(fd: FormData) {
  const s = await requireUser();
  const id = String(fd.get("id") ?? "");
  const c = await prisma.classSession.findUnique({ where: { id } });
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_classId: { userId: s.userId, classId: id } },
  });
  if (!c || !enrollment) redirect(`/classes/${id}?err=forbidden`);

  const now = Date.now();
  const opens = c.startsAt.getTime() - 15 * 60000;
  const closes = c.startsAt.getTime() + c.durationMin * 60000;
  if (now < opens || now > closes) redirect(`/classes/${id}?err=closed`);

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { attended: true, attendedAt: new Date() },
  });
  redirect(`/classes/${id}?msg=checkedin`);
}
