import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { updateEBook } from "@/actions/ebooks";
import EBookForm from "@/components/EBookForm";

export const dynamic = "force-dynamic";

export default async function EditEBookPage({ params }: { params: { id: string } }) {
  const s = await requireUser(["INSTRUCTOR", "ADMIN"]);
  const book = await prisma.eBook.findUnique({ where: { id: params.id } });
  if (!book) notFound();
  if (s.role !== "ADMIN" && book.createdById !== s.userId) redirect("/ebooks?err=forbidden");

  return (
    <div>
      <h1 className="h1 mb-5">Edit e-book</h1>
      <EBookForm
        action={updateEBook}
        submitLabel="Save changes"
        initial={{
          id: book.id,
          title: book.title,
          author: book.author,
          subject: book.subject,
          price: book.price,
          description: book.description,
          fileUrl: book.fileUrl,
        }}
      />
    </div>
  );
}
