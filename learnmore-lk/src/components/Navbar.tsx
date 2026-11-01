import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/actions/auth";

export default async function Navbar() {
  const s = await getSession();
  const link = "text-sm font-medium text-slate-600 hover:text-brand-600";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600">
          LearnMore<span className="text-slate-900">.lk</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/classes" className={link}>Classes</Link>
          <Link href="/papers" className={link}>Papers</Link>
          <Link href="/ebooks" className={link}>E-Books</Link>
          {s && <Link href="/library" className={link}>My Library</Link>}
          {s && <Link href="/cart" className={link}>Cart</Link>}
          {s && <Link href="/orders" className={link}>Orders</Link>}
          {s && <Link href="/dashboard" className={link}>Dashboard</Link>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {s ? (
            <>
              <span className="hidden text-sm text-slate-500 sm:inline">
                {s.name} <span className="badge bg-brand-50 text-brand-700">{s.role}</span>
              </span>
              <form action={logout}>
                <button className="btn-secondary btn-sm">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary btn-sm">Login</Link>
              <Link href="/register" className="btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
