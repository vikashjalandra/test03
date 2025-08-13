import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const protectedPaths = ["/dashboard"]; // add more protected routes here
  const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const cookie = req.cookies.get("session")?.value;
  if (!cookie) {
    url.pathname = "/(auth)/phone"; // redirect to login
    return NextResponse.redirect(url);
  }

  // Edge middleware cannot verify session cookies with Admin SDK
  // Only check for presence of cookie and redirect if missing
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"], // keep in sync with protectedPaths
};
