import { requireUser } from "@/lib/auth";
import { createEBook } from "@/actions/ebooks";
import EBookForm from "@/components/EBookForm";

export default async function NewEBookPage() {
  await requireUser(["INSTRUCTOR", "ADMIN"]);
  return (
    <div>
      <h1 className="h1 mb-5">Add e-book</h1>
      <EBookForm action={createEBook} submitLabel="Create e-book" />
    </div>
  );
}
