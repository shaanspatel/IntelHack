// src/lib/auth.ts
import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth"

import { signOut } from "firebase/auth"
import { auth } from "./firebase"

  


  export const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }
  
  
  export const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)
  
  export const registerWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name })
  
      await auth.currentUser.reload() // 🔁 ensures latest profile
    }
  
    return userCredential.user
  }
  
  export const logout = () => signOut(auth)