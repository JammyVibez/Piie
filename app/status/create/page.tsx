
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Image as ImageIcon, Type, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

const backgroundColors = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
]

export default function CreateStatusPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState(backgroundColors[0])
  const [mode, setMode] = useState<"text" | "image">("text")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setMode("image")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a status",
        variant: "destructive",
      })
      return
    }

    if (!content && !image) {
      toast({
        title: "Content required",
        description: "Please add text or an image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          image: mode === "image" ? image : null,
          backgroundColor: mode === "text" ? backgroundColor : null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Status created",
          description: "Your status has been posted successfully",
        })
        router.push("/")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create Status</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <X size={24} />
          </Button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "text" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("text")}
          >
            <Type size={18} className="mr-2" />
            Text
          </Button>
          <Button
            variant={mode === "image" ? "default" : "outline"}
            className="flex-1"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <ImageIcon size={18} className="mr-2" />
            Image
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Preview */}
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 mb-6">
          <div
            className="relative min-h-96 p-6 flex items-end"
            style={{
              background: mode === "image" && image ? `url(${image})` : backgroundColor,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {mode === "text" && (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="bg-transparent border-none text-white text-lg font-semibold placeholder:text-white/60 resize-none focus-visible:ring-0"
                rows={3}
                maxLength={150}
              />
            )}
            {mode === "image" && (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a caption..."
                className="bg-black/50 backdrop-blur-sm border-none text-white text-lg font-semibold placeholder:text-white/60 resize-none focus-visible:ring-0"
                rows={2}
                maxLength={150}
              />
            )}
          </div>
        </div>

        {/* Background color picker (text mode only) */}
        {mode === "text" && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={18} />
              <span className="text-sm font-medium">Background Color</span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {backgroundColors.map((color, index) => (
                <button
                  key={index}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    backgroundColor === color ? "border-primary scale-110" : "border-border/50"
                  }`}
                  style={{ background: color }}
                  onClick={() => setBackgroundColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Character count */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted-foreground">
            {content.length}/150 characters
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting || (!content && !image)}
          >
            {isSubmitting ? "Posting..." : "Post Status"}
          </Button>
        </div>
      </div>
    </div>
  )
}
