import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ACCOUNT_PAGES = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];

/**
 * Sends visitors without a session cookie to the sign-in page before an
 * account page renders. This is a convenience only — the cookie's validity is
 * checked by the API on every request, which is where access is enforced.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC_ACCOUNT_PAGES.some((p) => pathname === p)) return NextResponse.next();
  if (req.cookies.has("pkv_session")) return NextResponse.next();

  const login = new URL("/account/login", req.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/account/:path*"] };
