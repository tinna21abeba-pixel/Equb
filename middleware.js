import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export function middleware(request) {
  if (request.cookies.get(SESSION_COOKIE)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL("/signin", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/equbs/:path*", "/api/equbs/:path*"] };