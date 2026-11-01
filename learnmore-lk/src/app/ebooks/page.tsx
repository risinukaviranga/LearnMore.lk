import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatLKR } from "@/lib/format";
import { SUBJECTS } from "@/lib/constants";
import Flash from "@/components/Flash";
import Pagination from "@/components/Pagination";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteEBook } from "@/actions/ebooks";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 6;

type SP = { q?: string; subject?: string; sort?: string; page?: string; msg?: string; err?: string };

const SORTS: Record<string, Prisma.EBookOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  title: { title: "asc" },
};

export default async function EBooksPage({ searchParams }: { searchParams: SP }) {
  const session = await getSession();
  const q = searchParams.q?.trim() ?? "";
  const sort = searchParams.sort && SORTS[searchParams.sort] ? searchParams.sort : "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.EBookWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { author: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(searchParams.subject ? { subject: searchParams.subject } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.eBook.findMany({ where, orderBy: SORTS[sort], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.eBook.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canCreate = session?.role === "INSTRUCTOR" || session?.role === "ADMIN";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">E-Book Store</h1>
        {canCreate && <Link href="/ebooks/new" className="btn-primary">+ Add e-book</Link>}
      </div>
      <Flash msg={searchParams.msg} err={searchParams.err} />

      <form className="card mb-6 grid gap-3 sm:grid-cols-4" method="GET">
        <input name="q" defaultValue={q} placeholder="Search title or author…" className="input sm:col-span-2" />
        <select name="subject" defaultValue={searchParams.subject ?? ""} className="input">
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="input">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="title">Title A–Z</option>
        </select>
        <div className="flex gap-2 sm:col-span-4">
          <button className="btn-primary btn-sm">Apply</button>
          <Link href="/ebooks" className="btn-secondary btn-sm">Reset</Link>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="card text-center text-slate-500">No e-books match your search.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => {
            const canManage = session && (session.role === "ADMIN" || session.userId === b.createdById);
            return (
              <div key={b.id} className="card flex flex-col">
                <span className="badge self-start bg-brand-50 text-brand-700">{b.subject}</span>
                <Link href={`/ebooks/${b.id}`} className="mt-2 text-lg font-semibold text-slate-900 hover:text-brand-600">
                  {b.title}
                </Link>
                <p className="text-sm text-slate-500">by {b.author}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{b.description}</p>
                <p className="mt-3 text-lg font-bold text-slate-900">{b.price === 0 ? "Free" : formatLKR(b.price)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link href={`/ebooks/${b.id}`} className="btn-secondary btn-sm">View</Link>
                  {canManage && (
                    <>
                      <Link href={`/ebooks/${b.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                      <form action={deleteEBook}>
                        <input type="hidden" name="id" value={b.id} />
                        <ConfirmButton message={`Delete "${b.title}"? This cannot be undone.`}>Delete</ConfirmButton>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        basePath="/ebooks"
        params={{ q, subject: searchParams.subject, sort }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
