import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOwMVyP_JEDLQJRY813-0G4c_5TeAcgP8",
  authDomain: "vite-project-c58ed.firebaseapp.com",
  projectId: "vite-project-c58ed",
  storageBucket: "vite-project-c58ed.firebasestorage.app",
  messagingSenderId: "372277482188",
  appId: "1:372277482188:web:827872a5b437dbe052e869",
  measurementId: "G-0HD87JTGGM",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
