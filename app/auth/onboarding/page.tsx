"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, ArrowLeft, Loader2, Upload, Check, Sparkles, Users, Compass, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { useToast } from "@/hooks/use-toast"

const interests = [
  { id: "tech", label: "Technology", icon: "💻" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "art", label: "Art", icon: "🖼️" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "food", label: "Food", icon: "🍕" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "photography", label: "Photography", icon: "📷" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "science", label: "Science", icon: "🔬" },
]

interface SuggestedUser {
  id: string
  name: string
  role: string
  avatar: string | null
  followers: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [followingUsers, setFollowingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const { toast } = useToast()

  const totalSteps = 4

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        router.push("/auth/login")
        return
      }

      try {
        const [userRes, suggestedRes] = await Promise.all([
          fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/users/suggested?limit=4", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.success) {
            setCurrentUser(userData.data)
            if (userData.data.avatar) setAvatarUrl(userData.data.avatar)
            if (userData.data.bio) setBio(userData.data.bio)
            if (userData.data.location) setLocation(userData.data.location)
          }
        }

        if (suggestedRes.ok) {
          const suggestedData = await suggestedRes.json()
          if (suggestedData.success) {
            setSuggestedUsers(suggestedData.data)
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }

        loadData()
    }, [router])

    // Realtime subscription for user updates
    useEffect(() => {
      if (!currentUser?.id) return

      const token = localStorage.getItem("auth_token")
      if (!token) return

      const channel = realtimeManager.subscribeToTable(
        {
          table: "User",
          event: "UPDATE",
          filter: `id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            const updatedUser = payload.new as any
            setCurrentUser(prev => ({ ...prev, ...updatedUser }))
            if (updatedUser.avatar) setAvatarUrl(updatedUser.avatar)
            if (updatedUser.bio) setBio(updatedUser.bio)
            if (updatedUser.location) setLocation(updatedUser.location)
          }
        }
      )

      return () => {
        realtimeManager.unsubscribe(`User-id=eq.${currentUser.id}`)
      }
    }, [currentUser?.id])

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleFollow = async (id: string) => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    const isCurrentlyFollowing = followingUsers.includes(id)
    
    try {
      const method = isCurrentlyFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${id}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        setFollowingUsers((prev) => 
          isCurrentlyFollowing 
            ? prev.filter((i) => i !== id) 
            : [...prev, id]
        )
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error)
    }
  }

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setIsLoading(true)
      
      try {
        const token = localStorage.getItem("auth_token")
        if (token && currentUser) {
          await fetch(`/api/users/${currentUser.id}/onboarding`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bio,
              location,
              avatar: avatarUrl,
              interests: selectedInterests,
              followingUserIds: followingUsers,
            }),
          })
        }
      } catch (error) {
        console.error("Failed to save onboarding data:", error)
      }

      router.push("/")
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return true // Profile is optional
      case 2:
        return selectedInterests.length >= 3
      case 3:
        return true // Following is optional
      case 4:
        return true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <Card className="w-full max-w-2xl border-border/50 shadow-2xl relative z-10 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step 1: Profile Setup */}
          {step === 1 && (
            <div className="space-y-6 fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
                <p className="text-muted-foreground mt-2">Add some details to personalize your experience</p>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={avatarUrl || "/placeholder.svg?key=d1j5c"} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
                    <Upload size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        if (!file.type.startsWith('image/')) {
                          toast({
                            title: "Error",
                            description: "Please select an image file",
                            variant: "destructive"
                          })
                          return
                        }

                        setAvatarFile(file)
                        setIsUploading(true)
                        
                        try {
                          const token = localStorage.getItem("auth_token")
                          if (!token) {
                            toast({
                              title: "Error",
                              description: "Please login to upload avatar",
                              variant: "destructive"
                            })
                            return
                          }

                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('type', 'avatar')

                          const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                            body: formData,
                          })

                          if (!uploadRes.ok) {
                            throw new Error('Upload failed')
                          }

                          const uploadData = await uploadRes.json()
                          if (uploadData.success && uploadData.data?.url) {
                            setAvatarUrl(uploadData.data.url)
                            toast({
                              title: "Success",
                              description: "Avatar uploaded successfully"
                            })
                          }
                        } catch (error) {
                          console.error("Upload error:", error)
                          toast({
                            title: "Error",
                            description: "Failed to upload avatar",
                            variant: "destructive"
                          })
                        } finally {
                          setIsUploading(false)
                        }
                      }}
                    />
                  </label>
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="min-h-[100px] resize-none"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-6 fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4">
                  <Compass size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">What are you interested in?</h1>
                <p className="text-muted-foreground mt-2">Select at least 3 topics to personalize your feed</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all hover:scale-105",
                      selectedInterests.includes(interest.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/50",
                    )}
                  >
                    <span className="text-2xl block mb-1">{interest.icon}</span>
                    <span className="text-xs font-medium text-foreground">{interest.label}</span>
                    {selectedInterests.includes(interest.id) && (
                      <Check size={14} className="text-primary mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {selectedInterests.length} of 3 minimum selected
              </p>
            </div>
          )}

          {/* Step 3: Follow Suggestions */}
          {step === 3 && (
            <div className="space-y-6 fade-in-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Follow some creators</h1>
                <p className="text-muted-foreground mt-2">
                  Based on your interests, here are some people you might like
                </p>
              </div>

              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      followingUsers.includes(user.id)
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30",
                    )}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.role} • {user.followers} followers
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={followingUsers.includes(user.id) ? "outline" : "default"}
                      className={cn(
                        followingUsers.includes(user.id)
                          ? "bg-transparent"
                          : "bg-gradient-to-r from-primary to-secondary",
                      )}
                      onClick={() => toggleFollow(user.id)}
                    >
                      {followingUsers.includes(user.id) ? "Following" : "Follow"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: All Done */}
          {step === 4 && (
            <div className="space-y-6 fade-in-up text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <Trophy size={48} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">You're all set!</h1>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Your profile is ready. Start exploring, connecting, and creating amazing content!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <p className="text-2xl font-bold text-primary">{selectedInterests.length}</p>
                  <p className="text-xs text-muted-foreground">Interests</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30">
                  <p className="text-2xl font-bold text-secondary-foreground">{followingUsers.length}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
                <div className="p-4 rounded-xl bg-accent/10">
                  <p className="text-2xl font-bold text-accent-foreground">1</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ArrowLeft size={18} />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    step > i ? "bg-primary" : step === i + 1 ? "bg-primary/50" : "bg-muted",
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {step === totalSteps ? "Getting Ready..." : "Loading..."}
                </>
              ) : step === totalSteps ? (
                <>
                  Let's Go!
                  <Sparkles size={18} />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
