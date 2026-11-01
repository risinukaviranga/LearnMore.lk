import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Flash from "@/components/Flash";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { msg?: string; err?: string } }) {
  const [classes, papers, ebooks] = await Promise.all([
    prisma.classSession.count(),
    prisma.paper.count(),
    prisma.eBook.count(),
  ]);

  const features = [
    { title: "Live Online Classes", href: "/classes", text: "Schedule, join and check in to interactive live sessions.", n: classes, label: "classes" },
    { title: "Past Papers", href: "/papers", text: "Browse by subject, grade, year and term. Free and premium papers.", n: papers, label: "papers" },
    { title: "E-Book Store", href: "/ebooks", text: "Buy study packs and read them in your personal online library.", n: ebooks, label: "e-books" },
  ];

  return (
    <div className="space-y-10">
      <Flash msg={searchParams.msg} err={searchParams.err} />
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-800 px-6 py-14 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Learn more. Score more.</h1>
        <p className="mx-auto mt-3 max-w-xl text-indigo-100">
          LearnMore.lk is a learning platform for live classes, past papers and digital study books.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register" className="btn bg-white text-brand-700 hover:bg-indigo-50">Get started</Link>
          <Link href="/ebooks" className="btn border border-white/60 text-white hover:bg-white/10">Browse e-books</Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="card transition hover:border-brand-500">
            <h2 className="text-lg font-semibold text-slate-900">{f.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
            <p className="mt-4 text-sm font-medium text-brand-600">
              {f.n} {f.label} available →
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
