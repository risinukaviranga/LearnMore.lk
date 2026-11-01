import Flash from "@/components/Flash";
import { LoginForm } from "@/components/AuthForms";

export default function LoginPage({ searchParams }: { searchParams: { next?: string; msg?: string } }) {
  return (
    <div>
      <Flash msg={searchParams.msg} />
      <LoginForm next={searchParams.next} />
    </div>
  );
}
