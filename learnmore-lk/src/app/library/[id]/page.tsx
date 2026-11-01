import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ReaderPage({ params }: { params: { id: string } }) {
  const s = await requireUser();
  const item = await prisma.orderItem.findFirst({
    where: { ebookId: params.id, order: { userId: s.userId, status: "PAID" } },
    include: { ebook: true },
  });
  if (!item) redirect("/library?err=forbidden");

  const user = await prisma.user.findUnique({ where: { id: s.userId } });
  const mark = `${user?.email ?? s.name} · LearnMore.lk`;

  return (
    <div>
      <Link href="/library" className="text-sm text-brand-600 hover:underline">← Back to library</Link>
      <h1 className="h1 my-3">{item.ebook.title}</h1>
      {/* In-app reader: no raw download link is shown; the toolbar is hidden and the page is watermarked
          with the buyer's email. (A browser-side deterrent - full DRM needs a dedicated service.) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
        <iframe src={`${item.ebook.fileUrl}#toolbar=0&navpanes=0`} title={item.ebook.title} className="h-[75vh] w-full" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="select-none text-3xl font-bold text-slate-400/25 sm:text-5xl" style={{ transform: "rotate(-30deg)" }}>
            {mark}
          </span>
        </div>
      </div>
    </div>
  );
}
