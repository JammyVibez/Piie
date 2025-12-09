"use client"

import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.id) {
        redirect(`/profile/${user.id}`)
      } else if (!isAuthenticated) {
        redirect('/auth/login')
      }
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Sign in to view your profile</h1>
        <p className="text-muted-foreground">Please sign in to access your profile page</p>
        <a href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90">
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
