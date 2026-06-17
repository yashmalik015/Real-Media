import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBlyofRcdFSydK8rtW106dMZCAmEV7ugP4",
  authDomain: "realmedia-9e290.firebaseapp.com",
  projectId: "realmedia-9e290",
  storageBucket: "realmedia-9e290.firebasestorage.app",
  messagingSenderId: "908201210038",
  appId: "1:908201210038:web:f1915072f934fbea9ab617",
  measurementId: "G-3PKLNX2QKP",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export const analyticsPromise = isSupported()
  .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  .catch(() => null);

export async function signInWithGoogle() {
  try {
    // Check if popup is supported
    if (!window.opener && !window.parent) {
      console.warn("Popup may be blocked by browser");
    }
    
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", {
      code: error.code,
      message: error.message,
      customData: error.customData,
    });
    throw error;
  }
}

export function logoutFirebase() {
  return signOut(firebaseAuth).catch(() => {});
}
