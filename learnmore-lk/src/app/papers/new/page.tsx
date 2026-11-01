import { requireUser } from "@/lib/auth";
import { createPaper } from "@/actions/papers";
import PaperForm from "@/components/PaperForm";

export default async function NewPaperPage() {
  await requireUser(["INSTRUCTOR", "ADMIN"]);
  return (
    <div>
      <h1 className="h1 mb-5">Upload paper</h1>
      <PaperForm action={createPaper} submitLabel="Create paper" />
    </div>
  );
}
