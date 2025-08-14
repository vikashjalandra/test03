import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return NextResponse.json({ uid: decodedToken.uid, email: decodedToken.email, phone_number: decodedToken.phone_number });
  } catch (error) {
    const errMsg = (error && typeof error === 'object' && 'message' in error) ? (error as { message?: string }).message : undefined;
    return NextResponse.json({ error: errMsg || "Invalid token" }, { status: 401 });
  }
}
