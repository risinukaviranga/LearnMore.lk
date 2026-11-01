"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"] as const;
const STATUSES = ["PAID", "REFUNDED", "CANCELLED"] as const;

export async function updateUserRole(fd: FormData) {
  const s = await requireUser(["ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const role = String(fd.get("role") ?? "");
  if (!ROLES.includes(role as (typeof ROLES)[number])) redirect("/dashboard?err=forbidden");
  if (id === s.userId) redirect("/dashboard?err=self");

  await prisma.user.update({ where: { id }, data: { role: role as (typeof ROLES)[number] } });
  redirect("/dashboard?msg=updated");
}

export async function updateOrderStatus(fd: FormData) {
  await requireUser(["ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) redirect("/dashboard?err=forbidden");

  await prisma.order.update({ where: { id }, data: { status: status as (typeof STATUSES)[number] } });
  redirect("/dashboard?msg=updated");
}
