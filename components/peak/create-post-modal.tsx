"use client"

import { useState } from "react"
import { X, ImageIcon, Video, Music, FileText, Plus } from "lucide-react"

interface CreatePostModalProps {
  onClose: () => void
  onPostCreate: (post: any) => void
}

const POST_TEMPLATES = [
  { id: "text", label: "Text Post", icon: "✍️", color: "from-blue-500 to-cyan-500" },
  { id: "poll", label: "Poll", icon: "📊", color: "from-purple-500 to-pink-500" },
  { id: "event", label: "Event", icon: "📅", color: "from-orange-500 to-red-500" },
  { id: "article", label: "Article", icon: "📰", color: "from-green-500 to-emerald-500" },
  { id: "carousel", label: "Carousel", icon: "🖼️", color: "from-yellow-500 to-orange-500" },
  { id: "poll-question", label: "Question", icon: "❓", color: "from-indigo-500 to-purple-500" },
]

export default function CreatePostModal({ onClose, onPostCreate }: CreatePostModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("text")
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [pollOptions, setPollOptions] = useState(["Option 1", "Option 2"])

  const handleCreatePost = () => {
    if (!content.trim()) return

    const newPost = {
      id: Date.now(),
      author: "You",
      avatar: "😊",
      timestamp: "now",
      type: selectedTemplate,
      content: content,
      title: title,
      engagement: { likes: 0, comments: 0, reactions: 0 },
      tags: [],
      mood: "active",
    }

    if (selectedTemplate === "poll") {
      newPost.poll = {
        options: pollOptions.map((opt) => ({ text: opt, votes: 0 })),
        total: 0,
      }
    }

    onPostCreate(newPost)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Template Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Choose a template</h3>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {POST_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setContent("")
                    setPollOptions(["Option 1", "Option 2"])
                  }}
                  className={`p-3 rounded-lg transition-all text-center ${
                    selectedTemplate === template.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <div className="text-xs font-semibold">{template.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          {selectedTemplate !== "poll" && (
            <>
              {selectedTemplate === "article" && (
                <input
                  type="text"
                  placeholder="Article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mb-4 px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
                />
              )}
              <textarea
                placeholder={`What's on your mind? ${selectedTemplate === "event" ? "(Event details)" : ""}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none resize-none h-40"
              />
            </>
          )}

          {/* Poll Options */}
          {selectedTemplate === "poll" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ask a question..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
              />
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions]
                      newOptions[index] = e.target.value
                      setPollOptions(newOptions)
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none text-sm"
                  />
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  <Plus className="w-4 h-4" />
                  Add option
                </button>
              )}
            </div>
          )}

          {/* Attachments */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Add media</h3>
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all text-sm">
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all text-sm">
                <Video className="w-4 h-4" />
                Video
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all text-sm">
                <Music className="w-4 h-4" />
                Audio
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-all text-sm">
                <FileText className="w-4 h-4" />
                File
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex gap-3 justify-end bg-muted/30">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-muted transition-all text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePost}
            disabled={!content.trim()}
            className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
