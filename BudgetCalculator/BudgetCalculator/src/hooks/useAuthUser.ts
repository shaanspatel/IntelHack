// hooks/useAuthUser.ts
"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(null)
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          await user.reload()
          setUser(auth.currentUser) // reload and update
        } else {
          setUser(null)
        }
      })
      return unsubscribe
    }, [])
  
    return user
  }
