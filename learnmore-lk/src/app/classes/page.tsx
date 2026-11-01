import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { classStatus, formatDateTime } from "@/lib/format";
import { GRADES, SUBJECTS } from "@/lib/constants";
import Flash from "@/components/Flash";
import Pagination from "@/components/Pagination";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteClass } from "@/actions/classes";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 6;

type SP = { q?: string; subject?: string; grade?: string; when?: string; sort?: string; page?: string; msg?: string; err?: string };

const STATUS_STYLE = {
  UPCOMING: "bg-blue-100 text-blue-800",
  LIVE: "bg-red-100 text-red-700",
  ENDED: "bg-slate-200 text-slate-600",
} as const;

export default async function ClassesPage({ searchParams }: { searchParams: SP }) {
  const session = await getSession();
  const q = searchParams.q?.trim() ?? "";
  const when = searchParams.when ?? "upcoming";
  const sort = searchParams.sort === "latest" ? "latest" : "soonest";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const now = new Date();

  const where: Prisma.ClassSessionWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(searchParams.subject ? { subject: searchParams.subject } : {}),
    ...(Number(searchParams.grade) ? { grade: Number(searchParams.grade) } : {}),
    // "upcoming" includes classes still running (started within the last 8 hours max duration)
    ...(when === "upcoming" ? { startsAt: { gte: new Date(now.getTime() - 8 * 3600 * 1000) } } : {}),
    ...(when === "past" ? { startsAt: { lt: now } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.classSession.findMany({
      where,
      include: { instructor: true, _count: { select: { enrollments: true } } },
      orderBy: { startsAt: sort === "latest" ? "desc" : "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.classSession.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canCreate = session?.role === "INSTRUCTOR" || session?.role === "ADMIN";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h1">Live Classes</h1>
        {canCreate && <Link href="/classes/new" className="btn-primary">+ Schedule class</Link>}
      </div>
      <Flash msg={searchParams.msg} err={searchParams.err} />

      <form className="card mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5" method="GET">
        <input name="q" defaultValue={q} placeholder="Search title…" className="input sm:col-span-3 lg:col-span-5" />
        <select name="subject" defaultValue={searchParams.subject ?? ""} className="input">
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="grade" defaultValue={searchParams.grade ?? ""} className="input">
          <option value="">All grades</option>
          {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select name="when" defaultValue={when} className="input">
          <option value="upcoming">Upcoming &amp; live</option>
          <option value="past">Past classes</option>
          <option value="all">All</option>
        </select>
        <select name="sort" defaultValue={sort} className="input">
          <option value="soonest">Soonest first</option>
          <option value="latest">Latest first</option>
        </select>
        <div className="flex gap-2">
          <button className="btn-primary btn-sm">Apply</button>
          <Link href="/classes" className="btn-secondary btn-sm">Reset</Link>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="card text-center text-slate-500">No classes found.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((c) => {
            const st = classStatus(c.startsAt, c.durationMin);
            const canManage = session && (session.role === "ADMIN" || session.userId === c.instructorId);
            return (
              <div key={c.id} className="card flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_STYLE[st]}`}>{st}</span>
                  <span className="badge bg-brand-50 text-brand-700">{c.subject} · Grade {c.grade}</span>
                </div>
                <Link href={`/classes/${c.id}`} className="mt-2 text-lg font-semibold hover:text-brand-600">{c.title}</Link>
                <p className="text-sm text-slate-500">
                  {formatDateTime(c.startsAt)} · {c.durationMin} min
                </p>
                <p className="text-sm text-slate-500">
                  {c.instructor.name} · {c._count.enrollments} enrolled
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link href={`/classes/${c.id}`} className="btn-secondary btn-sm">Details</Link>
                  {canManage && (
                    <>
                      <Link href={`/classes/${c.id}/edit`} className="btn-secondary btn-sm">Edit</Link>
                      <form action={deleteClass}>
                        <input type="hidden" name="id" value={c.id} />
                        <ConfirmButton message={`Delete "${c.title}" and all its enrollments?`}>Delete</ConfirmButton>
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
        basePath="/classes"
        params={{ q, subject: searchParams.subject, grade: searchParams.grade, when, sort }}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
