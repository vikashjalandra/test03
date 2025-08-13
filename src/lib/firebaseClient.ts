
import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";



const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
};


export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let verifier: RecaptchaVerifier | null = null;

export async function getRecaptcha(containerId = "recaptcha-container") {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA can only be initialized in the browser.");
  }
  if (!verifier) {
    verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
    await verifier.render();
  }
  return verifier;
}

export async function sendOtp(phone: string) {
  const v = await getRecaptcha();
  return signInWithPhoneNumber(auth, phone, v);
}
