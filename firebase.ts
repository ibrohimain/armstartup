
// Fix: Use @firebase scope for more reliable module resolution in some environments
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfSRwgcuT7Z8tpDBSzj9FWN-w2AWwv5e0",
  authDomain: "armlogin-48ff8.firebaseapp.com",
  projectId: "armlogin-48ff8",
  storageBucket: "armlogin-48ff8.firebasestorage.app",
  messagingSenderId: "821869833646",
  appId: "1:821869833646:web:78148f0cd98a0c6fb96c3f",
  measurementId: "G-C9GW4LWEC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);