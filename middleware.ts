import { NextResponse, type NextRequest } from "next/server";

/**
 * Routing strategy
 * ----------------
 *
 * The same Vercel deployment answers two domains:
 *
 *   1. The main docs at lumera-docs.vercel.app (or any host not in
 *      LUKSO_HOSTS). Behaviour: `/` redirects to `/docs`. Everything else
 *      passes through.
 *
 *   2. The Lukso-only docs at lukso.lumera.help (and any other host listed
 *      in LUKSO_HOSTS). Behaviour:
 *        `/`             rewrites to /docs/lukso
 *        `/<sub>`        rewrites to /docs/lukso/<sub>
 *        `/docs/lukso/*` passes through unchanged
 *        `/docs/<other>` redirects to MAIN_DOCS_URL (escape hatch when an
 *                        in-page link goes outside the Lukso section)
 *
 * One git history, one Vercel project, two domains. To add another
 * Lukso-scoped host (e.g. a staging URL or a second custom domain), set
 * LUKSO_HOSTS to a comma-separated list.
 */

const LUKSO_HOSTS = new Set(
  (process.env.LUKSO_HOSTS ?? "lukso.lumera.help")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

const MAIN_DOCS_URL =
  process.env.MAIN_DOCS_URL ?? "https://lumera-docs.vercel.app";

function isLuksoHost(host: string | null): boolean {
  if (!host) return false;
  // Strip a port if present (localhost:3000 etc.) before comparing.
  const bare = host.toLowerCase().split(":")[0];
  return LUKSO_HOSTS.has(host.toLowerCase()) || LUKSO_HOSTS.has(bare);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host");

  if (!isLuksoHost(host)) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/docs";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Lukso-scoped host from here on.

  // Already in the Lukso namespace — pass through.
  if (pathname === "/docs/lukso" || pathname.startsWith("/docs/lukso/")) {
    return NextResponse.next();
  }

  // A sidebar / cross-section link tried to leave the section. Hand the
  // user off to the canonical main-docs deployment instead of serving
  // the page locally under a misleading host.
  if (pathname.startsWith("/docs/")) {
    return NextResponse.redirect(
      new URL(`${MAIN_DOCS_URL}${pathname}${req.nextUrl.search}`, req.url),
    );
  }

  // Root → /docs/lukso, /<anything> → /docs/lukso/<anything>.
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/docs/lukso" : `/docs/lukso${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes, and any path that looks like a static
  // asset (anything with a file extension). Everything else flows through
  // the middleware above.
  //
  // `api` MUST be excluded: on the Lukso-only host, the catch-all rewrite
  // at the end of `middleware()` would otherwise turn `/api/chat` into
  // `/docs/lukso/api/chat`, which has no route handler and falls back to
  // the docs page renderer. The chat client then receives an HTML body
  // where it expected an SSE stream.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
