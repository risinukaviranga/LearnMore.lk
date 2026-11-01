import Link from "next/link";

export default function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn-secondary btn-sm">← Previous</Link>
      ) : (
        <span className="btn-secondary btn-sm opacity-50">← Previous</span>
      )}
      <span className="text-slate-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className="btn-secondary btn-sm">Next →</Link>
      ) : (
        <span className="btn-secondary btn-sm opacity-50">Next →</span>
      )}
    </nav>
  );
}
