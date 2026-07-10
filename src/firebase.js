import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoWMVyP_JEdLQJRY813-0G4c_5TeACgP8", // Исправлено на большую C
  authDomain: "vite-project-c58ed.firebaseapp.com",
  projectId: "vite-project-c58ed",
  storageBucket: "vite-project-c58ed.firebasestorage.app",
  messagingSenderId: "372277482188",
  appId: "1:372277482188:web:827872a5b437dbe052e869",
  measurementId: "G-0HD87JTGGM",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
