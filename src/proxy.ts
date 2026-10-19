import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Locale routing (Next.js 16 renamed Middleware to Proxy).
 *
 * English is served at the root (`/about`) and Arabic under a prefix
 * (`/ar/about`). Internally every route lives at `/[locale]/...`, so
 * non-prefixed requests are rewritten to `/en/...` without changing the URL.
 *
 * Root-level English is deliberate: unikai.com's existing equity sits on
 * unprefixed URLs, and a /en redirect on every legacy path would add a hop.
 */

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Arabic already carries its prefix — serve as-is.
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return NextResponse.next();
  }

  // Anyone landing on an explicit /en URL is sent to the canonical root form,
  // so the same page is never reachable at two addresses.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
