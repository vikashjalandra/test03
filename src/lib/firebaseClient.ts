import { initializeApp, getApps, getApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJ7k4hGs1vdTfLWaFh7FIFcpvWlfjlP4Q",
  authDomain: "apla-plot-717d7.firebaseapp.com",
  projectId: "apla-plot-717d7",
  storageBucket: "apla-plot-717d7.firebasestorage.app",
  messagingSenderId: "918236516071",
  appId: "1:918236516071:web:3a1dbdd883980d6d7b5c42",
  measurementId: "G-D33WF1K631"
};

const app = getApps().length===0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };