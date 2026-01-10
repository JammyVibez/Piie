"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  avatar?: string | null
  bannerImage?: string | null
  bio?: string | null
  location?: string | null
  userRole: string
  workerRole?: string | null
  level: number
  xp: number
  influenceScore: number
  realm?: string | null
  isOnline: boolean
  emailVerified: boolean
  createdAt: string
  followers: number
  following: number
  joinedDate: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  name: string
  username: string
  email: string
  password: string
  userRole: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadUser = useCallback(async () => {
    // Only access localStorage in browser environment
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    // Check both localStorage and cookies for token
    const storedToken = localStorage.getItem("auth_token") || 
      (typeof document !== "undefined" ? document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1] : null)
    
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
          setToken(storedToken)
          if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", storedToken)
            localStorage.setItem("auth_user", JSON.stringify(data.data.user))
          }
        } else {
          // Only clear if explicitly failed with success: false (e.g. invalid token)
          console.warn("User validation failed:", data.error)
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("auth_user")
          }
          if (typeof document !== "undefined") {
            document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        // Only clear on auth errors
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
        }
        if (typeof document !== "undefined") {
          document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        }
      }
      // For other errors (500, network), keep the token to retry later
    } catch (error) {
      console.error("Error loading user:", error)
      // Do not clear token on network error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window === "undefined") {
      loadUser()
      return
    }

    // Try to load user from local storage first for immediate feedback
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user", e)
      }
    }
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response from login API:", text.substring(0, 200))
        return { success: false, error: "Server error. Please try again later." }
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setToken(data.data.token)
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", data.data.token)
          localStorage.setItem("auth_user", JSON.stringify(data.data.user))
        }
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof SyntaxError) {
        return { success: false, error: "Server returned invalid response. Please check your connection." }
      }
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const register = async (registerData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setToken(data.data.token)
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", data.data.token)
          localStorage.setItem("auth_user", JSON.stringify(data.data.user))
        }
        // Cookie is set by the server, but ensure it's also accessible
        if (typeof document !== "undefined") {
          document.cookie = `auth_token=${data.data.token}; max-age=${60 * 60 * 24 * 7}; path=/; SameSite=Lax`
        }
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch(() => {
          // Ignore network errors on logout
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      setToken(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
      if (typeof document !== "undefined") {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      }
      router.push("/auth/login")
    }
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
