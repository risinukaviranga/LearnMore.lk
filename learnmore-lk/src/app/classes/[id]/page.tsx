import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { classStatus, formatDateTime } from "@/lib/format";
import Flash from "@/components/Flash";
import ConfirmButton from "@/components/ConfirmButton";
import { checkIn, deleteClass, enroll, unenroll } from "@/actions/classes";

export const dynamic = "force-dynamic";

export default async function ClassDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; err?: string };
}) {
  const session = await getSession();
  const c = await prisma.classSession.findUnique({
    where: { id: params.id },
    include: {
      instructor: true,
      enrollments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!c) notFound();

  const st = classStatus(c.startsAt, c.durationMin);
  const mine = session ? c.enrollments.find((e) => e.userId === session.userId) : undefined;
  const canManage = session && (session.role === "ADMIN" || session.userId === c.instructorId);
  const canSeeLink = !!mine || canManage;

  return (
    <div className="max-w-3xl">
      <Link href="/classes" className="text-sm text-brand-600 hover:underline">← Back to classes</Link>
      <div className="mt-3"><Flash msg={searchParams.msg} err={searchParams.err} /></div>

      <div className="card space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-brand-50 text-brand-700">{c.subject} · Grade {c.grade}</span>
          <span className="badge bg-slate-100 text-slate-700">{st}</span>
        </div>
        <h1 className="h1">{c.title}</h1>
        <p className="text-sm text-slate-500">
          {formatDateTime(c.startsAt)} (Sri Lanka time) · {c.durationMin} minutes · Instructor: {c.instructor.name}
        </p>
        <p className="whitespace-pre-line text-slate-700">{c.description}</p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {session && !mine && st !== "ENDED" && (
            <form action={enroll}>
              <input type="hidden" name="id" value={c.id} />
              <button className="btn-primary">Enroll in this class</button>
            </form>
          )}
          {!session && <Link href={`/login?next=/classes/${c.id}`} className="btn-primary">Log in to enroll</Link>}

          {mine && (
            <>
              {canSeeLink && st !== "ENDED" && (
                <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Join class</a>
              )}
              {st !== "ENDED" && !mine.attended && (
                <form action={checkIn}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn-secondary">Check in (attendance)</button>
                </form>
              )}
              {mine.attended && <span className="badge bg-emerald-100 text-emerald-800">Attendance recorded</span>}
              {st === "UPCOMING" && (
                <form action={unenroll}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message="Leave this class?" className="btn-secondary">Leave class</ConfirmButton>
                </form>
              )}
            </>
          )}
          {!mine && canManage && st !== "ENDED" && (
            <a href={c.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Open meeting link</a>
          )}
        </div>

        {canManage && (
          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <Link href={`/classes/${c.id}/edit`} className="btn-secondary">Edit</Link>
            <form action={deleteClass}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`Delete "${c.title}" and all its enrollments?`} className="btn-danger">Delete</ConfirmButton>
            </form>
          </div>
        )}
      </div>

      {canManage && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Enrolled students ({c.enrollments.length})</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Email</th><th>Attendance</th></tr></thead>
              <tbody>
                {c.enrollments.length === 0 && (
                  <tr><td colSpan={3} className="text-slate-500">No students enrolled yet.</td></tr>
                )}
                {c.enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.user.name}</td>
                    <td>{e.user.email}</td>
                    <td>
                      {e.attended ? (
                        <span className="badge bg-emerald-100 text-emerald-800">Present</span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-600">Not checked in</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
