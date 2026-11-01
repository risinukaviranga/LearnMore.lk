import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updatePaper } from "@/actions/papers";
import PaperForm from "@/components/PaperForm";

export const dynamic = "force-dynamic";

export default async function EditPaperPage({ params }: { params: { id: string } }) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const p = await prisma.paper.findUnique({ where: { id: params.id } });
  if (!p) notFound();
  if (s.role !== "ADMIN" && p.uploaderId !== s.userId) redirect("/papers?err=forbidden");

  return (
    <div>
      <h1 className="h1 mb-5">Edit paper</h1>
      <PaperForm
        action={updatePaper}
        submitLabel="Save changes"
        initial={{
          id: p.id,
          title: p.title,
          subject: p.subject,
          grade: p.grade,
          year: p.year,
          term: p.term,
          isPremium: p.isPremium,
          fileUrl: p.fileUrl,
          markingSchemeUrl: p.markingSchemeUrl,
        }}
      />
    </div>
  );
}
