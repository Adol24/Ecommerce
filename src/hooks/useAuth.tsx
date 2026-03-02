'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AuthUser } from '@/lib/insforge-auth'
import { signIn as authSignIn, signOut as authSignOut, getSession } from '@/lib/insforge-auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: AuthUser; accessToken?: string }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    setIsLoading(true)
    const { data } = await getSession()
    if (data?.accessToken) {
      try {
        await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        })
      } catch (error) {
        console.error("[useAuth] failed to sync auth cookies:", error)
      }
    }
    setUser(data?.user || null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession()
  }, [refreshSession])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authSignIn(email, password)
    if (error) {
      return { error }
    }
    if (data?.user) {
      setUser(data.user)
      return { user: data.user, accessToken: data.accessToken }
    }
    return {}
  }

  const signOut = async () => {
    try {
      await authSignOut()
    } catch {
      // ignore SDK errors, continue clearing session
    }
    try {
      await fetch("/api/auth/me", { method: "DELETE" })
    } catch {
      // ignore network errors, continue clearing session
    }
    setUser(null)
    // Hard navigation ensures service workers and all caches are bypassed.
    // router.push + router.refresh is unreliable on mobile/PWA.
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
