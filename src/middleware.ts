import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

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

  try {
    // Verify the **session cookie** (not the client ID token) server-side
    await adminAuth.verifySessionCookie(cookie, true);
    return NextResponse.next();
  } catch {
    url.pathname = "/(auth)/phone";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"], // keep in sync with protectedPaths
};
