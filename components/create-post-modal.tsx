"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  ImageIcon,
  FileText,
  Sparkles,
  X,
  Video,
  Mic,
  MapPin,
  AtSign,
  Hash,
  Smile,
  Globe,
  Lock,
  Users,
  Calendar,
  PillIcon as PollIcon,
  Link2,
  GripVertical,
  Trash2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: any) => void
}

const EMOJI_LIST = [
  "😀",
  "😂",
  "🥰",
  "😎",
  "🤔",
  "👍",
  "🔥",
  "❤️",
  "🎉",
  "💯",
  "✨",
  "🚀",
  "💡",
  "👏",
  "🙌",
  "💪",
  "🤝",
  "🎯",
  "⭐",
  "💎",
  "🌟",
  "🔮",
  "🎨",
  "📚",
]

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [postType, setPostType] = useState<"post" | "insight" | "media" | "poll" | "video" | "fusion">("post")
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false)
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [pollDuration, setPollDuration] = useState("24h")
  const [isMultipleChoice, setIsMultipleChoice] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number>(0)


  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!title.trim() && postType !== "poll") return
    if (postType === "poll" && pollOptions.filter((o) => o.trim()).length < 2) return

    setIsSubmitting(true)

    try {
      // In production, upload video first if present
      let videoUrl = null
      let thumbnailUrl = null

      if (videoFile) {
        // Simulate upload
        setIsUploading(true)
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((r) => setTimeout(r, 100))
          setUploadProgress(i)
        }
        videoUrl = videoPreview
        thumbnailUrl = videoThumbnail
        setIsUploading(false)
      }

      // In production: await fetch("/api/posts", { method: "POST", body: JSON.stringify({...}) })
      onSubmit({
        title,
        description,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images,
        video: videoUrl,
        videoThumbnail: thumbnailUrl,
        videoDuration: videoDuration,
        postType,
        visibility,
        pollOptions:
          postType === "poll"
            ? {
                options: pollOptions.filter((o) => o.trim()).map((text, i) => ({ id: `opt-${i}`, text, votes: 0 })),
                duration: pollDuration,
                isMultipleChoice,
              }
            : undefined,
        scheduledFor: isScheduled ? scheduleDate : undefined,
      })

      resetForm()
      onClose()
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTags("")
    setImages([])
    setPostType("post")
    setVisibility("public")
    setPollOptions(["", ""])
    setPollDuration("24h")
    setIsMultipleChoice(false)
    setIsScheduled(false)
    setScheduleDate("")
    setVideoFile(null)
    setVideoPreview(null)
    setVideoThumbnail(null)
    setUploadProgress(0)
    setVideoDuration(0)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 4))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert("Video must be less than 100MB")
      return
    }

    setVideoFile(file)
    setPostType("video")

    // Create preview URL
    const url = URL.createObjectURL(file)
    setVideoPreview(url)

    // Generate thumbnail from video
    const video = document.createElement("video")
    video.src = url
    video.currentTime = 1
    video.onloadeddata = () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0)
      setVideoThumbnail(canvas.toDataURL("image/jpeg"))
    }
    video.onloadedmetadata = () => {
        setVideoDuration(Math.floor(video.duration))
    }
  }, [])

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview(null)
    setVideoThumbnail(null)
    setVideoDuration(0)
    if (postType === "video") {
      setPostType("post")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    const videoFiles = files.filter((f) => f.type.startsWith("video/"))

    // Handle video drop
    if (videoFiles.length > 0) {
      const file = videoFiles[0]
      if (file.size <= 100 * 1024 * 1024) {
        setVideoFile(file)
        setPostType("video")
        const url = URL.createObjectURL(file)
        setVideoPreview(url)
        const video = document.createElement("video")
        video.src = url
        video.onloadedmetadata = () => {
          setVideoDuration(Math.floor(video.duration))
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            setVideoThumbnail(canvas.toDataURL())
          }
        }
      }
      return
    }

    // Handle image drop
    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 4))
      }
      reader.readAsDataURL(file)
    })
  }

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newText = description.slice(0, start) + emoji + description.slice(end)
      setDescription(newText)
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start + emoji.length, start + emoji.length)
        textareaRef.current?.focus()
      }, 0)
    } else {
      setDescription((prev) => prev + emoji)
    }
    setShowEmojiPicker(false)
  }

  const visibilityOptions = [
    { value: "public", label: "Public", icon: Globe, desc: "Anyone can see" },
    { value: "followers", label: "Followers", icon: Users, desc: "Only followers" },
    { value: "private", label: "Private", icon: Lock, desc: "Only you" },
  ]

  const currentVisibility = visibilityOptions.find((v) => v.value === visibility)!

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 bg-card border glow-border rounded-xl overflow-hidden">
        <DialogHeader className="p-4 pb-0 border-b border-border/50">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xl">
              <Sparkles className="text-primary" size={24} />
              Create Post
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <currentVisibility.icon size={16} />
                  {currentVisibility.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {visibilityOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => setVisibility(opt.value as typeof visibility)}
                    className="gap-2"
                  >
                    <opt.icon size={16} />
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] scrollbar-thin">
          <div className="p-4 space-y-5">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                <AvatarImage src="/placeholder.svg?height=48&width=48" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">You</p>
                <p className="text-xs text-muted-foreground">Posting to your feed</p>
              </div>
            </div>

            {/* Post Type Selection */}
            <div className="flex gap-2 flex-wrap">
              {[
                { type: "post", label: "Post", icon: FileText },
                { type: "insight", label: "Insight", icon: Sparkles },
                { type: "media", label: "Media", icon: ImageIcon },
                { type: "video", label: "Video", icon: Video },
                { type: "poll", label: "Poll", icon: PollIcon },
                { type: "fusion", label: "Fusion", icon: Sparkles },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type as typeof postType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                    postType === type
                      ? "bg-primary/20 border-primary text-primary neon-glow"
                      : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{label}</span>
                  {type === "fusion" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                placeholder="What's your headline?"
                className="w-full mt-2 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/100</p>
            </div>

            {/* Description */}
            <div className="relative">
              <label className="text-sm font-semibold text-foreground">Description</label>
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => {
                  const text = e.target.value.slice(0, 2000)
                  setDescription(text)

                  // Detect hashtags and mentions
                  const lastChar = text[text.length - 1]
                  if (lastChar === '#') {
                    setShowHashtagSuggestions(true)
                  } else if (lastChar === '@') {
                    setShowMentionSuggestions(true)
                  } else {
                    setShowHashtagSuggestions(false)
                    setShowMentionSuggestions(false)
                  }
                }}
                placeholder={`Share your ${postType === "insight" ? "insights" : "thoughts"}... Use #hashtags and @mentions`}
                rows={5}
                className="w-full mt-2 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none scrollbar-thin"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Smile size={18} />
                  </button>
                  <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                    <AtSign size={18} />
                  </button>
                  <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                    <Hash size={18} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{description.length}/2000</p>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-3 bg-card border border-border rounded-lg shadow-lg z-10 animate-bubble-pop">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="p-2 hover:bg-muted rounded text-lg transition-transform hover:scale-125"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(postType === "video" || videoFile) && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Video</label>
                {videoPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <video src={videoPreview} className="w-full max-h-[300px] object-contain bg-black" controls />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-destructive rounded-full text-foreground hover:text-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <Progress value={uploadProgress} className="flex-1" />
                          <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all group ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                    }`}
                  >
                    <Video
                      size={32}
                      className="mx-auto text-muted-foreground group-hover:text-primary mb-2 transition-colors"
                    />
                    <p className="text-sm text-muted-foreground group-hover:text-foreground">
                      Click or drag to upload video
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV up to 100MB</p>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Poll Options */}
            {postType === "poll" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Poll Options</label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions]
                        newOptions[index] = e.target.value
                        setPollOptions(newOptions)
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                        className="p-2 hover:bg-destructive/10 rounded text-destructive transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="w-full bg-transparent"
                  >
                    Add Option
                  </Button>
                )}

                <div className="flex flex-wrap gap-4 pt-3 border-t border-border/50">
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="1h">1 hour</option>
                      <option value="6h">6 hours</option>
                      <option value="24h">24 hours</option>
                      <option value="3d">3 days</option>
                      <option value="7d">7 days</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="multipleChoice"
                      checked={isMultipleChoice}
                      onChange={(e) => setIsMultipleChoice(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="multipleChoice" className="text-sm text-muted-foreground">
                      Allow multiple choices
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-sm font-semibold text-foreground">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. tech, design, innovation (comma separated)"
                className="w-full mt-2 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {tags && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags
                    .split(",")
                    .filter((t) => t.trim())
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Image Upload (for non-video posts) */}
            {postType !== "video" && !videoFile && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Images ({images.length}/4)</label>
                {images.length === 0 ? (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all group ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                    }`}
                  >
                    <ImageIcon
                      size={32}
                      className="mx-auto text-muted-foreground group-hover:text-primary mb-2 transition-colors"
                    />
                    <p className="text-sm text-muted-foreground group-hover:text-foreground">
                      Click or drag to upload images
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {images.map((img, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden border border-border group">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                          <button
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive rounded-full text-foreground hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {images.length < 4 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-transparent"
                      >
                        <ImageIcon size={16} className="mr-2" />
                        Add More
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                <Video size={16} /> Video
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                <Mic size={16} /> Audio
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                <MapPin size={16} /> Location
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground">
                <Link2 size={16} /> Link
              </button>
              <button
                onClick={() => setIsScheduled(!isScheduled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  isScheduled
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar size={16} /> Schedule
              </button>
            </div>

            {/* Schedule Date */}
            {isScheduled && (
              <div className="animate-message-slide">
                <label className="text-sm font-semibold text-foreground">Schedule for</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full mt-2 px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            )}

            {/* Hidden video input */}
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </div>
        </ScrollArea>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-3 justify-between items-center p-4 border-t border-border/50 bg-card">
          <p className="text-xs text-muted-foreground">
            {isScheduled && scheduleDate ? `Scheduled for ${new Date(scheduleDate).toLocaleString()}` : "Posting now"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-border/50 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={(!title.trim() && postType !== "poll") || isSubmitting}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 transition-all neon-glow gap-2"
            >
              <Sparkles size={18} />
              {isSubmitting ? "Publishing..." : isScheduled ? "Schedule" : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}