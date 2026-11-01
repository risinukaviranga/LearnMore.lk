import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toColomboInput } from "@/lib/format";
import { updateClass } from "@/actions/classes";
import ClassForm from "@/components/ClassForm";

export const dynamic = "force-dynamic";

export default async function EditClassPage({ params }: { params: { id: string } }) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const c = await prisma.classSession.findUnique({ where: { id: params.id } });
  if (!c) notFound();
  if (s.role !== "ADMIN" && c.instructorId !== s.userId) redirect("/classes?err=forbidden");

  return (
    <div>
      <h1 className="h1 mb-5">Edit class</h1>
      <ClassForm
        action={updateClass}
        submitLabel="Save changes"
        initial={{
          id: c.id,
          title: c.title,
          description: c.description,
          subject: c.subject,
          grade: c.grade,
          startsAt: toColomboInput(c.startsAt),
          durationMin: c.durationMin,
          meetingUrl: c.meetingUrl,
        }}
      />
    </div>
  );
}
