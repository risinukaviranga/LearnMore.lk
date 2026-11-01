import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate, formatLKR } from "@/lib/format";
import Flash from "@/components/Flash";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteEBook } from "@/actions/ebooks";
import { addToCart } from "@/actions/shop";

export const dynamic = "force-dynamic";

export default async function EBookDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { msg?: string; err?: string };
}) {
  const session = await getSession();
  const book = await prisma.eBook.findUnique({ where: { id: params.id }, include: { createdBy: true } });
  if (!book) notFound();

  const owned = session
    ? (await prisma.orderItem.count({
        where: { ebookId: book.id, order: { userId: session.userId, status: "PAID" } },
      })) > 0
    : false;
  const canManage = session && (session.role === "ADMIN" || session.userId === book.createdById);

  return (
    <div className="max-w-3xl">
      <Link href="/ebooks" className="text-sm text-brand-600 hover:underline">← Back to store</Link>
      <div className="mt-3">
        <Flash msg={searchParams.msg} err={searchParams.err} />
      </div>
      <div className="card space-y-3">
        <span className="badge bg-brand-50 text-brand-700">{book.subject}</span>
        <h1 className="h1">{book.title}</h1>
        <p className="text-sm text-slate-500">
          by {book.author} · added {formatDate(book.createdAt)} by {book.createdBy.name}
        </p>
        <p className="whitespace-pre-line text-slate-700">{book.description}</p>
        <p className="text-2xl font-bold">{book.price === 0 ? "Free" : formatLKR(book.price)}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {owned ? (
            <Link href={`/library/${book.id}`} className="btn-primary">Read in My Library</Link>
          ) : (
            <form action={addToCart}>
              <input type="hidden" name="id" value={book.id} />
              <button className="btn-primary">Add to cart</button>
            </form>
          )}
          {canManage && (
            <>
              <Link href={`/ebooks/${book.id}/edit`} className="btn-secondary">Edit</Link>
              <form action={deleteEBook}>
                <input type="hidden" name="id" value={book.id} />
                <ConfirmButton message={`Delete "${book.title}"? This cannot be undone.`} className="btn-danger">
                  Delete
                </ConfirmButton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
