"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Github, Chrome, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const userRoles = [
  { value: "creator", label: "Creator", description: "Share content and build your audience" },
  { value: "analyst", label: "Analyst", description: "Analyze trends and share insights" },
  { value: "entertainer", label: "Entertainer", description: "Bring joy and entertainment" },
  { value: "educator", label: "Educator", description: "Teach and share knowledge" },
  { value: "explorer", label: "Explorer", description: "Discover and curate content" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (step === 1) {
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (passwordStrength < 3) {
        setError("Please create a stronger password")
        return
      }
      setStep(2)
      return
    }

    if (!userRole) {
      setError("Please select your role")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    const result = await register({
      name,
      username,
      email,
      password,
      userRole,
    })

    if (result.success) {
      router.push("/auth/onboarding")
    } else {
      setError(result.error || "Registration failed")
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary/80 to-primary" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-40 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">Join P!!E</h1>
          <p className="text-xl text-white/80 mb-8">Start your journey to becoming part of an amazing community.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">1M+</p>
              <p className="text-white/70">Active Users</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">500K+</p>
              <p className="text-white/70">Creators</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">10K+</p>
              <p className="text-white/70">Communities</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-3xl font-bold">50M+</p>
              <p className="text-white/70">Posts Shared</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Step {step} of 2 - {step === 1 ? "Basic information" : "Choose your path"}
            </CardDescription>
            <div className="flex gap-2 mt-4">
              <div className={cn("h-1 flex-1 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
              <div className={cn("h-1 flex-1 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Chrome size={18} />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Github size={18} />
                    GitHub
                  </Button>
                </div>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or register with email
                  </span>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm fade-in-up">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && (
                      <div className="space-y-2 fade-in-up">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-all",
                                passwordStrength >= i
                                  ? passwordStrength <= 2
                                    ? "bg-red-500"
                                    : passwordStrength === 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  : "bg-muted",
                              )}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              passwordChecks.length ? "text-green-500" : "text-muted-foreground",
                            )}
                          >
                            {passwordChecks.length ? <Check size={12} /> : <X size={12} />} 8+ characters
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              passwordChecks.uppercase ? "text-green-500" : "text-muted-foreground",
                            )}
                          >
                            {passwordChecks.uppercase ? <Check size={12} /> : <X size={12} />} Uppercase
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              passwordChecks.lowercase ? "text-green-500" : "text-muted-foreground",
                            )}
                          >
                            {passwordChecks.lowercase ? <Check size={12} /> : <X size={12} />} Lowercase
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              passwordChecks.number ? "text-green-500" : "text-muted-foreground",
                            )}
                          >
                            {passwordChecks.number ? <Check size={12} /> : <X size={12} />} Number
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-destructive fade-in-up">Passwords do not match</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        type="text"
                        placeholder="yourname"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Choose your role</Label>
                    <div className="grid gap-2">
                      {userRoles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setUserRole(role.value)}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all",
                            userRole === role.value
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-primary/50",
                          )}
                        >
                          <p className="font-medium text-foreground">{role.label}</p>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </>
                  ) : step === 1 ? (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}