import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatLKR } from "@/lib/format";
import Flash from "@/components/Flash";

export const dynamic = "force-dynamic";

const STATUS_STYLE = {
  PAID: "bg-emerald-100 text-emerald-800",
  REFUNDED: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-slate-200 text-slate-600",
} as const;

export default async function OrdersPage({ searchParams }: { searchParams: { msg?: string; err?: string } }) {
  const s = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: s.userId },
    include: { items: { include: { ebook: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="h1 mb-5">My orders &amp; receipts</h1>
      <Flash msg={searchParams.msg} err={searchParams.err} />

      {orders.length === 0 ? (
        <p className="card text-center text-slate-500">
          You have not bought anything yet. <Link href="/ebooks" className="text-brand-600 underline">Visit the store</Link>.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)} · via {o.method}</p>
                </div>
                <span className={`badge ${STATUS_STYLE[o.status]}`}>{o.status}</span>
              </div>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between py-1.5">
                    <span>{i.ebook.title}</span>
                    <span>{formatLKR(i.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-right font-bold">Total: {formatLKR(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
