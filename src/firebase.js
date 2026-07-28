import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvgwi4YtA0rnGJmoWREGhIXjazGN-zz_Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "assetsweber-db57d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "assetsweber-db57d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "assetsweber-db57d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "434071848900",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:434071848900:web:f7f223b615727d1abf4691",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RX43SD1PNK",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const GoogleAuthProviderClass = GoogleAuthProvider;
export const googleProvider = new GoogleAuthProvider();

export const analyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

/**
 * Trigger Google Popup sign-in and return the Firebase ID Token.
 * @returns {Promise<{ user: import('firebase/auth').User, idToken: string }>}
 */
export async function signInWithGoogle() {
  console.log("GOOGLE LOGIN STARTED");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();
    console.log("FIREBASE POPUP SUCCESS - ID Token generated");
    return { user, idToken };
  } catch (error) {
    console.error("LOGIN FAILED - Google Sign-In Error:", {
      code: error.code,
      message: error.message,
    });
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export async function handleGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    if (error.code === "auth/no-redirect-result" || error.code === "auth/network-request-failed") {
      return null;
    }
    console.error("Google Redirect Result Error:", error);
    throw error;
  }
}

export function logoutFirebase() {
  return signOut(auth).catch(() => {});
}
