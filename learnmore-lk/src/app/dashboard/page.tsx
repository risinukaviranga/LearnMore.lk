import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { classStatus, formatDateTime, formatLKR } from "@/lib/format";
import Flash from "@/components/Flash";
import ConfirmButton from "@/components/ConfirmButton";
import { updateOrderStatus, updateUserRole } from "@/actions/admin";
import { deleteClass } from "@/actions/classes";
import { deleteEBook } from "@/actions/ebooks";
import { deletePaper } from "@/actions/papers";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { msg?: string; err?: string } }) {
  const s = await requireUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">Dashboard</h1>
        <p className="text-sm text-slate-500">Welcome back, {s.name}.</p>
      </div>
      <Flash msg={searchParams.msg} err={searchParams.err} />
      {s.role === "ADMIN" && <AdminView />}
      {s.role === "INSTRUCTOR" && <InstructorView userId={s.userId} />}
      {s.role === "STUDENT" && <StudentView userId={s.userId} />}
    </div>
  );
}

async function StudentView({ userId }: { userId: string }) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { class: { include: { instructor: true } } },
    orderBy: { class: { startsAt: "asc" } },
  });
  const books = await prisma.orderItem.count({ where: { order: { userId, status: "PAID" } } });
  const attended = enrollments.filter((e) => e.attended).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Enrolled classes" value={enrollments.length} />
        <Stat label="Classes attended" value={attended} />
        <Stat label="E-books owned" value={books} />
      </div>
      <section>
        <h2 className="mb-2 text-lg font-semibold">My class timetable</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Class</th><th>When</th><th>Instructor</th><th>Status</th></tr></thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="text-slate-500">
                  You are not enrolled in any class. <Link href="/classes" className="text-brand-600 underline">Find a class</Link>.
                </td></tr>
              )}
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td><Link href={`/classes/${e.classId}`} className="font-medium hover:text-brand-600">{e.class.title}</Link></td>
                  <td>{formatDateTime(e.class.startsAt)}</td>
                  <td>{e.class.instructor.name}</td>
                  <td>{classStatus(e.class.startsAt, e.class.durationMin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

async function InstructorView({ userId }: { userId: string }) {
  const [classes, papers, ebooks] = await Promise.all([
    prisma.classSession.findMany({
      where: { instructorId: userId },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { startsAt: "desc" },
    }),
    prisma.paper.findMany({ where: { uploaderId: userId }, orderBy: { createdAt: "desc" } }),
    prisma.eBook.findMany({
      where: { createdById: userId },
      include: { _count: { select: { orderItems: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const enrollments = classes.reduce((n, c) => n + c._count.enrollments, 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="My classes" value={classes.length} />
        <Stat label="Total enrollments" value={enrollments} />
        <Stat label="My papers" value={papers.length} />
        <Stat label="My e-books" value={ebooks.length} />
      </div>

      <section>
        <SectionHead title="My classes" href="/classes/new" cta="+ Schedule class" />
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>When</th><th>Enrolled</th><th></th></tr></thead>
            <tbody>
              {classes.length === 0 && <EmptyRow cols={4} />}
              {classes.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/classes/${c.id}`} className="font-medium hover:text-brand-600">{c.title}</Link></td>
                  <td>{formatDateTime(c.startsAt)}</td>
                  <td>{c._count.enrollments}</td>
                  <td>
                    <RowActions editHref={`/classes/${c.id}/edit`} id={c.id} action={deleteClass} label={c.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHead title="My papers" href="/papers/new" cta="+ Upload paper" />
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Grade</th><th>Year</th><th></th></tr></thead>
            <tbody>
              {papers.length === 0 && <EmptyRow cols={4} />}
              {papers.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/papers/${p.id}`} className="font-medium hover:text-brand-600">{p.title}</Link></td>
                  <td>{p.grade}</td>
                  <td>{p.year}</td>
                  <td><RowActions editHref={`/papers/${p.id}/edit`} id={p.id} action={deletePaper} label={p.title} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHead title="My e-books" href="/ebooks/new" cta="+ Add e-book" />
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Price</th><th>Sold</th><th></th></tr></thead>
            <tbody>
              {ebooks.length === 0 && <EmptyRow cols={4} />}
              {ebooks.map((b) => (
                <tr key={b.id}>
                  <td><Link href={`/ebooks/${b.id}`} className="font-medium hover:text-brand-600">{b.title}</Link></td>
                  <td>{formatLKR(b.price)}</td>
                  <td>{b._count.orderItems}</td>
                  <td><RowActions editHref={`/ebooks/${b.id}/edit`} id={b.id} action={deleteEBook} label={b.title} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

async function AdminView() {
  const [users, orders, paidAgg, classes, papers, ebooks] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 15 }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true }, _count: true }),
    prisma.classSession.count(),
    prisma.paper.count(),
    prisma.eBook.count(),
  ]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Users" value={users.length} />
        <Stat label="Classes" value={classes} />
        <Stat label="Papers" value={papers} />
        <Stat label="E-books" value={ebooks} />
        <Stat label="Paid orders" value={paidAgg._count} />
        <Stat label="Revenue" value={formatLKR(paidAgg._sum.total ?? 0)} />
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold">User management</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td colSpan={2}>
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="input !w-auto !py-1">
                        <option>STUDENT</option>
                        <option>INSTRUCTOR</option>
                        <option>ADMIN</option>
                      </select>
                      <button className="btn-secondary btn-sm">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Payment verification (latest orders)</h2>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Student</th><th>Total</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {orders.length === 0 && <EmptyRow cols={6} />}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id.slice(-8).toUpperCase()}</td>
                  <td>{o.user.name}</td>
                  <td>{formatLKR(o.total)}</td>
                  <td>{o.method}</td>
                  <td>{formatDateTime(o.createdAt)}</td>
                  <td>
                    <form action={updateOrderStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select name="status" defaultValue={o.status} className="input !w-auto !py-1">
                        <option>PAID</option>
                        <option>REFUNDED</option>
                        <option>CANCELLED</option>
                      </select>
                      <button className="btn-secondary btn-sm">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card !p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SectionHead({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link href={href} className="btn-primary btn-sm">{cta}</Link>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr><td colSpan={cols} className="text-slate-500">Nothing here yet.</td></tr>
  );
}

function RowActions({
  editHref,
  id,
  action,
  label,
}: {
  editHref: string;
  id: string;
  action: (fd: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Link href={editHref} className="btn-secondary btn-sm">Edit</Link>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <ConfirmButton message={`Delete "${label}"?`}>Delete</ConfirmButton>
      </form>
    </div>
  );
}
