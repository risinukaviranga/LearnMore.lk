import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import Flash from "@/components/Flash";

export const dynamic = "force-dynamic";

export default async function LibraryPage({ searchParams }: { searchParams: { msg?: string; err?: string } }) {
  const s = await requireUser();
  const items = await prisma.orderItem.findMany({
    where: { order: { userId: s.userId, status: "PAID" } },
    include: { ebook: true },
    orderBy: { order: { createdAt: "desc" } },
  });

  return (
    <div>
      <h1 className="h1 mb-5">My Library</h1>
      <Flash msg={searchParams.msg} err={searchParams.err} />
      {items.length === 0 ? (
        <p className="card text-center text-slate-500">
          Your bookshelf is empty. <Link href="/ebooks" className="text-brand-600 underline">Browse e-books</Link>.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.id} className="card flex flex-col">
              <span className="badge self-start bg-brand-50 text-brand-700">{i.ebook.subject}</span>
              <h2 className="mt-2 font-semibold">{i.ebook.title}</h2>
              <p className="text-sm text-slate-500">by {i.ebook.author}</p>
              <Link href={`/library/${i.ebookId}`} className="btn-primary mt-auto self-start">Read now</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
