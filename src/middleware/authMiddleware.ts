import { NextResponse, type NextRequest } from "next/server";

export function authMiddleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const hasSupabaseCookie = request.cookies.getAll().some((cookie) => cookie.name.includes("sb-"));

  if (isAdminRoute && process.env.NODE_ENV === "production" && !hasSupabaseCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
