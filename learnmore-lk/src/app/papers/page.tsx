import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GRADES, SUBJECTS, TERMS } from "@/lib/constants";
import Flash from "@/components/Flash";
import Pagination from "@/components/Pagination";
import ConfirmButton from "@/components/ConfirmButton";
import { deletePaper } from "@/actions/papers";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 8;

type SP = {
  q?: string; subject?: string; grade?: string; year?: string; term?: string;
  access?: string; sort?: string; page?: string; msg?: string; err?: string;
};

const SORTS: Record<string, Prisma.PaperOrderByWithRelationInput[]> = {
  year_desc: [{ year: "desc" }, { term: "asc" }],
  year_asc: [{ year: "asc" }, { term: "asc" }],
  title: [{ title: "asc" }],
};

export default async function PapersPage({ searchParams }: { searchParams: SP }) {
  const session = await getSession();
  const q = searchParams.q?.trim() ?? "";
  const sort = searchParams.sort && SORTS[searchParams.sort] ? searchParams.sort : "year_desc";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.PaperWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(searchParams.subject ? { subject: searchParams.subject } : {}),
    ...(Number(searchParams.grade) ? { grade: Number(searchParams.grade) } : {}),
    ...(Number(searchParams.year) ? { year: Number(searchParams.year) } : {}),
    ...(Number(searchParams.term) ? { term: Number(searchParams.term) } : {}),
    ...(searchParams.access === "free" ? { isPremium: false } : {}),
    ...(searchParams.access === "premium" ? { isPremium: true } : {}),
  };

  const [items, total, yearRows] = await Promise.all([
    prisma.paper.findMany({ where, orderBy: SORTS[sort], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.paper.count({ where }),
    prisma.paper.findMany({ distinct: ["year"], select: { year: true }, orderBy: { year: "desc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canCreate = session?.role === "INSTRUCTOR" || session?.role === "ADMIN";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Past Papers</h1>
        {canCreate && <Link href="/papers/new" className="btn-primary">+ Upload paper</Link>}
      </div>
      <Flash msg={searchParams.msg} err={searchParams.err} />

      <form className="card mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4" method="GET">
        <input name="q" defaultValue={q} placeholder="Search title…" className="input sm:col-span-3 lg:col-span-4" />
        <select name="subject" defaultValue={searchParams.subject ?? ""} className="input">
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="grade" defaultValue={searchParams.grade ?? ""} className="input">
          <option value="">All grades</option>
          {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select name="year" defaultValue={searchParams.year ?? ""} className="input">
          <option value="">All years</option>
          {yearRows.map((y) => <option key={y.year}>{y.year}</option>)}
        </select>
        <select name="term" defaultValue={searchParams.term ?? ""} className="input">
          <option value="">All terms</option>
          {TERMS.map((t) => <option key={t} value={t}>Term {t}</option>)}
        </select>
        <select name="access" defaultValue={searchParams.access ?? ""} className="input">
          <option value="">Free + Premium</option>
          <option value="free">Free only</option>
          <option value="premium">Premium only</option>
        </select>
        <select name="sort" defaultValue={sort} className="input">
          <option value="year_desc">Newest year first</option>
          <option value="year_asc">Oldest year first</option>
          <option value="title">Title A–Z</option>
        </select>
        <div className="flex gap-2">
          <button className="btn-primary btn-sm">Apply</button>
          <Link href="/papers" className="btn-secondary btn-sm">Reset</Link>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="card text-center text-slate-500">No papers match your filters.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Subject</th><th>Grade</th><th>Year</th><th>Term</th><th>Access</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const canManage = session && (session.role === "ADMIN" || session.userId === p.uploaderId);
                return (
                  <tr key={p.id}>
                    <td className="font-medium">
                      <Link href={`/papers/${p.id}`} className="hover:text-brand-600">{p.title}</Link>
                    </td>
                    <td>{p.subject}</td>
                    <td>{p.grade}</td>
                    <td>{p.year}</td>
                    <td>{p.term}</td>
                    <td>
                      <span className={`badge ${p.isPremium ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {p.isPremium ? "Premium" : "Free"}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/papers/${p.id}`} className="btn-secondary btn-sm">Open</Link>
                        {canManage && (
                          <>
                            <Link href={`/papers/${p.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                            <form action={deletePaper}>
                              <input type="hidden" name="id" value={p.id} />
                              <ConfirmButton message={`Delete "${p.title}"?`}>Delete</ConfirmButton>
                            </form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        basePath="/papers"
        params={{ q, subject: searchParams.subject, grade: searchParams.grade, year: searchParams.year, term: searchParams.term, access: searchParams.access, sort }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
