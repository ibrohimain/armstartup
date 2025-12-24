import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyCfSRwgcuT7Z8tpDBSzj9FWN-w2AWwv5e0",
  authDomain: "armlogin-48ff8.firebaseapp.com",
  projectId: "armlogin-48ff8",
  storageBucket: "armlogin-48ff8.firebasestorage.app",
  messagingSenderId: "821869833646",
  appId: "1:821869833646:web:78148f0cd98a0c6fb96c3f",
  measurementId: "G-C9GW4LWEC3"
};

const app = initializeApp(firebaseConfig);
// Firebase Analytics removed due to import issues in the current environment; it is not used elsewhere in the project.
export const db = getFirestore(app);
export const auth = getAuth(app);