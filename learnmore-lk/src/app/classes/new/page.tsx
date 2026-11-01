import { requireUser } from "@/lib/auth";
import { createClass } from "@/actions/classes";
import ClassForm from "@/components/ClassForm";

export default async function NewClassPage() {
  await requireUser(["INSTRUCTOR", "ADMIN"]);
  return (
    <div>
      <h1 className="h1 mb-5">Schedule a class</h1>
      <ClassForm action={createClass} submitLabel="Schedule class" />
    </div>
  );
}
