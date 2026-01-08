"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Type,
  Mic,
  Pencil,
  Sticker,
  Layers,
  Globe,
  Users,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateFusionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (fusionPost: any) => void
}

const LAYER_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "voice", label: "Voice", icon: Mic },
  { value: "draw", label: "Draw", icon: Pencil },
  { value: "sticker", label: "Sticker", icon: Sticker },
  { value: "overlay", label: "Overlay", icon: Layers },
]

export function CreateFusionModal({ isOpen, onClose, onSubmit }: CreateFusionModalProps) {
  const [title, setTitle] = useState("")
  const [seedContent, setSeedContent] = useState("")
  const [seedType, setSeedType] = useState<string>("text")
  const [privacy, setPrivacy] = useState<string>("public")
  const [allowedContributors, setAllowedContributors] = useState<string>("public")
  const [moderationMode, setModerationMode] = useState<string>("none")
  const [allowedLayerTypes, setAllowedLayerTypes] = useState<string[]>([
    "text",
    "image",
    "video",
    "voice",
    "draw",
    "sticker",
    "overlay",
  ])

  const handleSubmit = async () => {
    if (!title.trim() || !seedContent.trim()) return

    if (!token) {
      console.error("No auth token found")
      return
    }

    const fusionPost = {
      title,
      seedContent,
      seedType,
      privacy,
      allowedContributors,
      allowedLayerTypes,
      moderationMode,
    }

    try {
      const response = await fetch("/api/fusion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fusionPost),
      })

      const result = await response.json()
      if (result.success) {
        onSubmit(result.data)
        resetForm()
        onClose()
      } else {
        console.error("Failed to create fusion post:", result.error)
      }
    } catch (error) {
      console.error("Failed to create fusion post:", error)
    }
  }

  const resetForm = () => {
    setTitle("")
    setSeedContent("")
    setSeedType("text")
    setPrivacy("public")
    setAllowedContributors("public")
    setModerationMode("none")
    setAllowedLayerTypes(["text", "image", "video", "voice", "draw", "sticker", "overlay"])
  }

  const toggleLayerType = (type: string) => {
    setAllowedLayerTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="text-primary" size={24} />
            Create Fusion Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your fusion a title..."
              className="text-lg"
            />
          </div>

          {/* Seed Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Seed Content *</Label>
            <Textarea
              id="content"
              value={seedContent}
              onChange={(e) => setSeedContent(e.target.value)}
              placeholder="Start your fusion with initial content..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Seed Type */}
          <div className="space-y-2">
            <Label>Seed Type</Label>
            <Select value={seedType} onValueChange={setSeedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon size={16} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label>Who can see this fusion?</Label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    Public - Everyone
                  </div>
                </SelectItem>
                <SelectItem value="followers">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Followers Only
                  </div>
                </SelectItem>
                <SelectItem value="invited">
                  <div className="flex items-center gap-2">
                    <Lock size={16} />
                    Invited Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Contributors */}
          <div className="space-y-2">
            <Label>Who can add layers?</Label>
            <Select value={allowedContributors} onValueChange={setAllowedContributors}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Everyone</SelectItem>
                <SelectItem value="followers">Followers Only</SelectItem>
                <SelectItem value="invited">Invited Users</SelectItem>
                <SelectItem value="close_circle">Close Circle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Layer Types */}
          <div className="space-y-3">
            <Label>Allowed Layer Types</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAYER_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleLayerType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    allowedLayerTypes.includes(type.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <type.icon size={20} />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Moderation Mode */}
          <div className="space-y-2">
            <Label>Moderation</Label>
            <Select value={moderationMode} onValueChange={setModerationMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - Auto-accept all layers</SelectItem>
                <SelectItem value="pre_approve">Pre-approve - Review before adding</SelectItem>
                <SelectItem value="auto">Auto-moderate - AI filtering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !seedContent.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all gap-2"
          >
            <Sparkles size={18} />
            Create Fusion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}