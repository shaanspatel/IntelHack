// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAOJxbdZhmBCT7FhJm-Rrbp-6xAFM8YZzo",
  authDomain: "intelhack2025.firebaseapp.com",
  projectId: "intelhack2025",
  storageBucket: "intelhack2025.appspot.com", 
  messagingSenderId: "700372450649",
  appId: "1:700372450649:web:852790547fca3a7892a048",
  measurementId: "G-NC5VWMYC84",
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)

export { app, auth }
export const db = getFirestore(app)
