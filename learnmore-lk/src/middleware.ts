import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_SECRET, COOKIE_NAME } from "@/lib/config";

const protectedPrefixes = [
  "/dashboard",
  "/cart",
  "/orders",
  "/library",
  "/ebooks/new",
  "/papers/new",
  "/classes/new",
];
const editRe = /^\/(ebooks|papers|classes)\/[^/]+\/edit$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsLogin =
    protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    editRe.test(pathname);
  if (!needsLogin) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  try {
    if (!token) throw new Error("no token");
    await jwtVerify(token, new TextEncoder().encode(AUTH_SECRET));
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
