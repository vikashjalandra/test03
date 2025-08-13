"use client";

import { useState } from "react";
import { auth, sendOtp } from "@/lib/firebaseClient";

export default function PhoneLoginPage() {
  const [phone, setPhone] = useState("+91");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter-phone" | "enter-otp">("enter-phone");
  const [confirm, setConfirm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const start = async () => {
    setLoading(true);
    setMsg("");
    try {
      const confirmation = await sendOtp(phone);
      setConfirm(confirmation);
      setStep("enter-otp");
      setMsg("OTP sent.");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!confirm) return;
    setLoading(true);
    setMsg("");
    try {
      // Verify OTP on client
      await confirm.confirm(code);
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) throw new Error("No ID token found");

      // Send token to backend
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("Server verification failed");

      setMsg("Logged in!");
      window.location.href = "/dashboard";
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Phone Login</h1>

      {step === "enter-phone" && (
        <>
          <input
            className="border rounded w-full p-2"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={start}
            disabled={loading}
            className="w-full rounded p-2 border"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <div id="recaptcha-container" /> {/* required for verifier */}
        </>
      )}

      {step === "enter-otp" && (
        <>
          <input
            className="border rounded w-full p-2 tracking-widest"
            placeholder="Enter OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={verify}
            disabled={loading}
            className="w-full rounded p-2 border"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </>
      )}

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
