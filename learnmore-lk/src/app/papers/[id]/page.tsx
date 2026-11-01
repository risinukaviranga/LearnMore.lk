import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Flash from "@/components/Flash";
import ConfirmButton from "@/components/ConfirmButton";
import { deletePaper } from "@/actions/papers";

export const dynamic = "force-dynamic";

export default async function PaperDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; err?: string };
}) {
  const session = await getSession();
  const paper = await prisma.paper.findUnique({ where: { id: params.id }, include: { uploader: true } });
  if (!paper) notFound();

  const locked = paper.isPremium && !session;
  const canManage = session && (session.role === "ADMIN" || session.userId === paper.uploaderId);
  const watermark = session ? `${session.name} · LearnMore.lk` : "LearnMore.lk";

  return (
    <div className="max-w-4xl">
      <Link href="/papers" className="text-sm text-brand-600 hover:underline">← Back to papers</Link>
      <div className="mt-3"><Flash msg={searchParams.msg} err={searchParams.err} /></div>

      <div className="card space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-brand-50 text-brand-700">{paper.subject}</span>
          <span className="badge bg-slate-100 text-slate-700">Grade {paper.grade}</span>
          <span className="badge bg-slate-100 text-slate-700">{paper.year} · Term {paper.term}</span>
          <span className={`badge ${paper.isPremium ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
            {paper.isPremium ? "Premium" : "Free"}
          </span>
        </div>
        <h1 className="h1">{paper.title}</h1>
        <p className="text-sm text-slate-500">Uploaded by {paper.uploader.name}</p>

        {locked ? (
          <div className="alert-error">
            This is a premium paper. <Link href={`/login?next=/papers/${paper.id}`} className="font-semibold underline">Log in</Link> to view it.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <a href={paper.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Download paper</a>
              {paper.markingSchemeUrl && (
                <a href={paper.markingSchemeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  Marking scheme
                </a>
              )}
            </div>
            <div className="relative overflow-hidden rounded-lg border border-slate-200">
              <iframe src={`${paper.fileUrl}#toolbar=0`} title={paper.title} className="h-[520px] w-full" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="select-none text-3xl font-bold text-slate-400/30 sm:text-5xl" style={{ transform: "rotate(-30deg)" }}>
                  {watermark}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">Preview is watermarked to discourage unauthorized redistribution.</p>
          </>
        )}

        {canManage && (
          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <Link href={`/papers/${paper.id}/edit`} className="btn-secondary">Edit</Link>
            <form action={deletePaper}>
              <input type="hidden" name="id" value={paper.id} />
              <ConfirmButton message={`Delete "${paper.title}"?`} className="btn-danger">Delete</ConfirmButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
