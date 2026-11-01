"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function ownedEbookIds(userId: string): Promise<Set<string>> {
  const items = await prisma.orderItem.findMany({
    where: { order: { userId, status: "PAID" } },
    select: { ebookId: true },
  });
  return new Set(items.map((i) => i.ebookId));
}

export async function addToCart(fd: FormData) {
  const s = await requireUser();
  const ebookId = String(fd.get("id") ?? "");
  const ebook = await prisma.eBook.findUnique({ where: { id: ebookId } });
  if (!ebook) redirect("/ebooks?err=notfound");

  if ((await ownedEbookIds(s.userId)).has(ebookId)) redirect(`/ebooks/${ebookId}?err=owned`);

  await prisma.cartItem.upsert({
    where: { userId_ebookId: { userId: s.userId, ebookId } },
    create: { userId: s.userId, ebookId },
    update: {},
  });
  redirect("/cart?msg=added");
}

export async function removeFromCart(fd: FormData) {
  const s = await requireUser();
  const id = String(fd.get("id") ?? "");
  await prisma.cartItem.deleteMany({ where: { id, userId: s.userId } });
  redirect("/cart?msg=removed");
}

export async function checkout(fd: FormData) {
  const s = await requireUser();
  const method = String(fd.get("method") ?? "");
  if (!["PAYHERE", "STRIPE", "PAYPAL"].includes(method)) redirect("/cart?err=method");

  const cart = await prisma.cartItem.findMany({
    where: { userId: s.userId },
    include: { ebook: true },
  });
  if (cart.length === 0) redirect("/cart?err=empty");

  const owned = await ownedEbookIds(s.userId);
  const items = cart.filter((c) => !owned.has(c.ebookId));
  if (items.length === 0) {
    await prisma.cartItem.deleteMany({ where: { userId: s.userId } });
    redirect("/library?err=owned");
  }

  const total = items.reduce((sum, c) => sum + c.ebook.price, 0);

  // Demo payment gateway: in production this step is replaced by a PayHere / Stripe
  // redirect + webhook. The order is stored atomically together with its items.
  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: s.userId,
        total,
        method,
        status: "PAID",
        items: { create: items.map((c) => ({ ebookId: c.ebookId, price: c.ebook.price })) },
      },
    }),
    prisma.cartItem.deleteMany({ where: { userId: s.userId } }),
  ]);
  redirect("/orders?msg=paid");
}
