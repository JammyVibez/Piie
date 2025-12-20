"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  MessageSquare,
  Globe,
  Smartphone,
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Volume2,
  Moon,
  Sun,
  Trash2,
  Download,
  LogOut,
  HelpCircle,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

// Chat wallpaper options
const wallpaperOptions = [
  { id: "default", name: "Default", preview: null, color: "bg-background" },
  {
    id: "gradient-blue",
    name: "Blue Gradient",
    preview: null,
    color: "bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900",
  },
  {
    id: "gradient-purple",
    name: "Purple Gradient",
    preview: null,
    color: "bg-gradient-to-br from-purple-900 via-pink-800 to-slate-900",
  },
  {
    id: "gradient-green",
    name: "Green Gradient",
    preview: null,
    color: "bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900",
  },
  {
    id: "gradient-orange",
    name: "Sunset",
    preview: null,
    color: "bg-gradient-to-br from-orange-900 via-red-800 to-slate-900",
  },
  {
    id: "gradient-dark",
    name: "Dark Mode",
    preview: null,
    color: "bg-gradient-to-br from-gray-900 via-slate-800 to-black",
  },
  { id: "pattern-dots", name: "Dots Pattern", preview: "/dots-pattern-dark.jpg", color: "" },
  { id: "pattern-grid", name: "Grid Pattern", preview: "/grid-pattern-dark.jpg", color: "" },
  { id: "custom", name: "Custom Image", preview: null, color: "" },
]

const themeOptions = [
  { id: "default", name: "P!!E Default", color: "bg-primary" },
  { id: "gojo", name: "Gojo Blue", color: "bg-blue-500" },
  { id: "ocean", name: "Ocean Teal", color: "bg-cyan-500" },
  { id: "forest", name: "Forest Green", color: "bg-emerald-500" },
  { id: "sakura", name: "Sakura Pink", color: "bg-pink-500" },
  { id: "dragon", name: "Dragon Red", color: "bg-red-500" },
  { id: "sunset", name: "Sunset Orange", color: "bg-orange-500" },
  { id: "mint", name: "Mint Fresh", color: "bg-emerald-400" },
  { id: "lavender", name: "Lavender Dream", color: "bg-purple-400" },
  { id: "amber", name: "Amber Gold", color: "bg-amber-500" },
]

const fontSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
]

interface SettingsState {
  // Profile
  name: string
  username: string
  email: string
  bio: string
  location: string
  website: string
  avatar: string
  bannerImage?: string // Added for banner image

  // Notifications
  pushNotifications: boolean
  emailNotifications: boolean
  messageNotifications: boolean
  mentionNotifications: boolean
  followNotifications: boolean
  likeNotifications: boolean
  soundEnabled: boolean

  // Privacy
  profileVisibility: "public" | "followers" | "private"
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowMessages: "everyone" | "followers" | "none"
  showReadReceipts: boolean
  twoFactorEnabled: boolean

  // Appearance
  theme: string
  darkMode: boolean
  fontSize: string
  reducedMotion: boolean

  // Chat
  chatWallpaper: string
  customWallpaperUrl: string
  messageFontSize: number
  enterToSend: boolean
  showMediaPreview: boolean
  autoDownloadMedia: boolean

  // Language
  language: string
  timezone: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [wallpaperPreviewOpen, setWallpaperPreviewOpen] = useState(false)
  const [selectedWallpaper, setSelectedWallpaper] = useState("default")
  const [previewAvatar, setPreviewAvatar] = useState<string>("")
  const [previewBanner, setPreviewBanner] = useState<string>("") // State for banner preview
  const [isUploading, setIsUploading] = useState(false)

  // Using a form data state to manage settings changes before saving
  const [formData, setFormData] = useState<SettingsState>({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
    bannerImage: "", // Initialize banner image in formData
    pushNotifications: true,
    emailNotifications: true,
    messageNotifications: true,
    mentionNotifications: true,
    followNotifications: true,
    likeNotifications: false,
    soundEnabled: true,
    profileVisibility: "public",
    showOnlineStatus: true,
    showLastSeen: true,
    allowMessages: "everyone",
    showReadReceipts: true,
    twoFactorEnabled: false,
    theme: "default",
    darkMode: true,
    fontSize: "medium",
    reducedMotion: false,
    chatWallpaper: "default",
    customWallpaperUrl: "",
    messageFontSize: 14,
    enterToSend: true,
    showMediaPreview: true,
    autoDownloadMedia: true,
    language: "en",
    timezone: "America/Los_Angeles",
  })

  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        bannerImage: user.bannerImage || "", // Set banner image from user data
      }))
    }
  }, [user])

  useEffect(() => {
    if (formData.theme !== "default") {
      document.documentElement.setAttribute("data-theme", formData.theme)
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }, [formData.theme])

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!user || !token) return
    setIsSaving(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          avatar: formData.avatar,
          bannerImage: formData.bannerImage, // Include banner image in save
        }),
      })

      const result = await response.json()
      if (result.success) {
        console.log("Settings saved successfully")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = async () => {
    // Simulate data export
    const data = JSON.stringify(formData, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "peakit-data-export.json"
    a.click()
  }

  const settingsSections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "chat", label: "Chat Settings", icon: MessageSquare },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "devices", label: "Devices", icon: Smartphone },
  ]

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        setPreviewAvatar(data.data.url)
        setFormData((prev) => ({ ...prev, avatar: data.data.url }))
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token || !user) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "image")

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        const bannerUrl = data.data.url
        setPreviewBanner(bannerUrl)
        setFormData((prev) => ({ ...prev, bannerImage: bannerUrl }))
        
        // Auto-save banner immediately after upload
        const saveResponse = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            bannerImage: bannerUrl,
          }),
        })

        const saveResult = await saveResponse.json()
        if (saveResult.success) {
          console.log("Banner saved successfully")
        } else {
          console.error("Failed to save banner:", saveResult.error)
        }
      }
    } catch (error) {
      console.error("Banner upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={16} />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="lg:sticky lg:top-24 space-y-1 bg-card rounded-xl p-2 border border-border">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    activeTab === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <section.icon size={18} />
                  {section.label}
                </button>
              ))}

              {/* Danger Zone */}
              <div className="pt-4 mt-4 border-t border-border">
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
                <Link
                  href="/auth/login"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LogOut size={18} />
                  Log Out
                </Link>
              </div>
            </nav>
          </aside>

          {/* Settings Content */}
          <main className="flex-1 space-y-6">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

                  {/* Avatar and Banner */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24 ring-4 ring-background">
                        <AvatarImage src={previewAvatar || formData.avatar || "/placeholder.svg"} alt={formData.name} />
                        <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{formData.name}</h3>
                        <p className="text-sm text-muted-foreground">@{formData.username}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          type="button"
                        >
                          Change Avatar
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="avatar-upload"
                          onChange={handleAvatarChange}
                          disabled={isUploading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="banner">Banner Image</Label>
                      {(previewBanner || formData.bannerImage) && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={previewBanner || formData.bannerImage || "/placeholder.svg"}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Input
                        id="banner"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        disabled={isUploading}
                      />
                      {isUploading && <p className="text-sm text-muted-foreground">Uploading banner...</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" value={formData.name} onChange={(e) => updateSetting("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => updateSetting("username", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateSetting("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => updateSetting("bio", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateSetting("location", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => updateSetting("website", e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input id="current-password" type={showPassword ? "text" : "password"} />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bell size={20} className="text-primary" />
                        </div>
                        <div>
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.pushNotifications}
                        onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Mail size={20} className="text-blue-500" />
                        </div>
                        <div>
                          <Label className="text-base">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Get updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Volume2 size={20} className="text-green-500" />
                        </div>
                        <div>
                          <Label className="text-base">Sound Effects</Label>
                          <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.soundEnabled}
                        onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Activity Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { key: "messageNotifications" as const, label: "Messages", desc: "New messages from others" },
                      { key: "mentionNotifications" as const, label: "Mentions", desc: "When someone mentions you" },
                      { key: "followNotifications" as const, label: "New Followers", desc: "When someone follows you" },
                      { key: "likeNotifications" as const, label: "Likes", desc: "When someone likes your post" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-2">
                        <div>
                          <Label>{item.label}</Label>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={formData[item.key]}
                          onCheckedChange={(checked) => updateSetting(item.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Privacy Settings</h2>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select
                        value={formData.profileVisibility}
                        onValueChange={(value: "public" | "followers" | "private") =>
                          updateSetting("profileVisibility", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see</SelectItem>
                          <SelectItem value="followers">Followers Only</SelectItem>
                          <SelectItem value="private">Private - Only you</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Who can message you</Label>
                      <Select
                        value={formData.allowMessages}
                        onValueChange={(value: "everyone" | "followers" | "none") =>
                          updateSetting("allowMessages", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="followers">Followers Only</SelectItem>
                          <SelectItem value="none">No One</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Show Online Status</Label>
                        <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                      </div>
                      <Switch
                        checked={formData.showOnlineStatus}
                        onCheckedChange={(checked) => updateSetting("showOnlineStatus", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Show Last Seen</Label>
                        <p className="text-sm text-muted-foreground">Display when you were last active</p>
                      </div>
                      <Switch
                        checked={formData.showLastSeen}
                        onCheckedChange={(checked) => updateSetting("showLastSeen", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Read Receipts</Label>
                        <p className="text-sm text-muted-foreground">Show when you've read messages</p>
                      </div>
                      <Switch
                        checked={formData.showReadReceipts}
                        onCheckedChange={(checked) => updateSetting("showReadReceipts", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Security</h2>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Lock size={20} className="text-green-500" />
                      </div>
                      <div>
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSetting("twoFactorEnabled", checked)}
                    />
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Data & Storage</h2>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-transparent"
                      onClick={handleExportData}
                    >
                      <span className="flex items-center gap-2">
                        <Download size={18} />
                        Export Your Data
                      </span>
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Theme</h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => updateSetting("theme", theme.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          formData.theme === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-full mx-auto mb-2", theme.color)} />
                        <p className="text-sm font-medium">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Display</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {formData.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                          <Label className="text-base">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Toggle dark/light mode</p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.darkMode}
                        onCheckedChange={(checked) => updateSetting("darkMode", checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select value={formData.fontSize} onValueChange={(value) => updateSetting("fontSize", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground">Minimize animations</p>
                      </div>
                      <Switch
                        checked={formData.reducedMotion}
                        onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Settings */}
            {activeTab === "chat" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Chat Wallpaper</h2>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {wallpaperOptions.map((wallpaper) => (
                      <button
                        key={wallpaper.id}
                        onClick={() => {
                          setSelectedWallpaper(wallpaper.id)
                          updateSetting("chatWallpaper", wallpaper.id)
                        }}
                        className={cn(
                          "relative aspect-[3/4] rounded-xl border-2 overflow-hidden transition-all",
                          selectedWallpaper === wallpaper.id
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        {wallpaper.preview ? (
                          <img
                            src={wallpaper.preview || "/placeholder.svg"}
                            alt={wallpaper.name}
                            className="w-full h-full object-cover"
                          />
                        ) : wallpaper.id === "custom" ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ImageIcon size={24} className="text-muted-foreground" />
                          </div>
                        ) : (
                          <div className={cn("w-full h-full", wallpaper.color)} />
                        )}
                        {selectedWallpaper === wallpaper.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check size={24} className="text-primary" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center bg-black/50 text-white rounded px-1 py-0.5 truncate">
                          {wallpaper.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedWallpaper === "custom" && (
                    <div className="mt-4 space-y-2">
                      <Label>Custom Wallpaper URL</Label>
                      <Input
                        placeholder="https://example.com/wallpaper.jpg"
                        value={formData.customWallpaperUrl}
                        onChange={(e) => updateSetting("customWallpaperUrl", e.target.value)}
                      />
                    </div>
                  )}

                  {/* Wallpaper Preview */}
                  <Dialog open={wallpaperPreviewOpen} onOpenChange={setWallpaperPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        <Eye size={16} className="mr-2" />
                        Preview Wallpaper
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-0 overflow-hidden">
                      <div
                        className={cn(
                          "min-h-[400px] p-4",
                          wallpaperOptions.find((w) => w.id === selectedWallpaper)?.color || "bg-background",
                        )}
                      >
                        <DialogHeader className="bg-card/90 backdrop-blur rounded-xl p-4 mb-4">
                          <DialogTitle className="text-sm">Chat Preview</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="flex justify-end">
                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                              <p className="text-sm">Hey! How does this wallpaper look?</p>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                              <p className="text-sm">It looks amazing!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Chat Preferences</h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Message Font Size: {formData.messageFontSize}px</Label>
                        <span className="text-sm text-muted-foreground">{formData.messageFontSize}px</span>
                      </div>
                      <Slider
                        value={[formData.messageFontSize]}
                        onValueChange={([value]) => updateSetting("messageFontSize", value)}
                        min={12}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Enter to Send</Label>
                        <p className="text-sm text-muted-foreground">Press Enter to send messages</p>
                      </div>
                      <Switch
                        checked={formData.enterToSend}
                        onCheckedChange={(checked) => updateSetting("enterToSend", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Media Preview</Label>
                        <p className="text-sm text-muted-foreground">Show image/video previews in chat</p>
                      </div>
                      <Switch
                        checked={formData.showMediaPreview}
                        onCheckedChange={(checked) => updateSetting("showMediaPreview", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>Auto-download Media</Label>
                        <p className="text-sm text-muted-foreground">Automatically download photos and videos</p>
                      </div>
                      <Switch
                        checked={formData.autoDownloadMedia}
                        onCheckedChange={(checked) => updateSetting("autoDownloadMedia", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === "language" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Language & Region</h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={formData.language} onValueChange={(value) => updateSetting("language", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Devices Settings */}
            {activeTab === "devices" && (
              <div className="space-y-6 fade-in-up">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-6">Active Sessions</h2>

                  <div className="space-y-4">
                    {[
                      { device: "Chrome on MacOS", location: "San Francisco, CA", current: true, lastActive: "Now" },
                      {
                        device: "Safari on iPhone",
                        location: "San Francisco, CA",
                        current: false,
                        lastActive: "2 hours ago",
                      },
                      {
                        device: "Firefox on Windows",
                        location: "Los Angeles, CA",
                        current: false,
                        lastActive: "Yesterday",
                      },
                    ].map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Smartphone size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {session.device}
                              {session.current && (
                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.location} • {session.lastActive}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                            Log Out
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
                  >
                    Log Out All Other Devices
                  </Button>
                </div>
              </div>
            )}

            {/* Help Footer */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3">
                <HelpCircle size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Need help?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact support at{" "}
                    <a href="mailto:support@peakit.com" className="text-primary hover:underline">
                      support@p!!e.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To confirm, type <span className="font-mono font-bold">DELETE</span> below:
            </p>
            <Input placeholder="Type DELETE to confirm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}