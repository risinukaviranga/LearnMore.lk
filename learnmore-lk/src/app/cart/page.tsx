import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatLKR } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/constants";
import Flash from "@/components/Flash";
import { checkout, removeFromCart } from "@/actions/shop";

export const dynamic = "force-dynamic";

export default async function CartPage({ searchParams }: { searchParams: { msg?: string; err?: string } }) {
  const s = await requireUser();
  const items = await prisma.cartItem.findMany({
    where: { userId: s.userId },
    include: { ebook: true },
    orderBy: { createdAt: "asc" },
  });
  const total = items.reduce((sum, i) => sum + i.ebook.price, 0);

  return (
    <div className="max-w-3xl">
      <h1 className="h1 mb-5">Shopping cart</h1>
      <Flash msg={searchParams.msg} err={searchParams.err} />

      {items.length === 0 ? (
        <div className="card text-center">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link href="/ebooks" className="btn-primary mt-4">Browse e-books</Link>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>E-book</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link href={`/ebooks/${i.ebookId}`} className="font-medium hover:text-brand-600">{i.ebook.title}</Link>
                      <div className="text-xs text-slate-500">{i.ebook.author}</div>
                    </td>
                    <td>{i.ebook.price === 0 ? "Free" : formatLKR(i.ebook.price)}</td>
                    <td className="text-right">
                      <form action={removeFromCart}>
                        <input type="hidden" name="id" value={i.id} />
                        <button className="btn-secondary btn-sm">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="border-t border-slate-200 font-semibold">Total</td>
                  <td className="border-t border-slate-200 font-bold">{formatLKR(total)}</td>
                  <td className="border-t border-slate-200"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <form action={checkout} className="card mt-6 space-y-3">
            <h2 className="text-lg font-semibold">Checkout</h2>
            <div>
              <label htmlFor="method" className="label">Payment method</label>
              <select id="method" name="method" required className="input" defaultValue="PAYHERE">
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Demo mode: payment is simulated. In production this step redirects to PayHere / Stripe.
              </p>
            </div>
            <button className="btn-primary">Pay {formatLKR(total)}</button>
          </form>
        </>
      )}
    </div>
  );
}
