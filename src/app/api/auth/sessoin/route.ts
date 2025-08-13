export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    // Verify the client Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);

    // Optional: enforce additional checks
    if (!decoded.phone_number) {
      return NextResponse.json({ error: "Phone number missing" }, { status: 400 });
    }

    // Create a short-lived session cookie (e.g., 5 days)
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "session",
      value: sessionCookie,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return res;
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message || "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
