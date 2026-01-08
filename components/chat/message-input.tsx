"use client"

import React, { useState } from "react"
import { Send, Paperclip, Mic, Smile } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MessageInputProps {
  onSend: (message: string, attachments?: string[]) => void
  communityId: string
  isLoading?: boolean
}

export function MessageInput({ onSend, communityId, isLoading = false }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [drafts, setDrafts] = useLocalStorage<Record<string, string>>("message-drafts", {})

  // Load draft on mount
  React.useEffect(() => {
    const draft = drafts[communityId]
    if (draft) setMessage(draft)
  }, [communityId])

  // Save draft as user types
  React.useEffect(() => {
    const newDrafts = { ...drafts, [communityId]: message }
    setDrafts(newDrafts)
  }, [message, communityId])

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return

    if (!token) {
      alert("Please login to send messages")
      return
    }

    try {
      const uploadedUrls: string[] = []
      
      // Upload attachments if any
      for (const file of attachments) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "file")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            uploadedUrls.push(uploadData.data.url)
          }
        }
      }

      // Send message with attachments
      onSend(message, uploadedUrls.length > 0 ? uploadedUrls : undefined)
      setMessage("")
      setAttachments([])
      
      // Clear draft
      const newDrafts = { ...drafts }
      delete newDrafts[communityId]
      setDrafts(newDrafts)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        setAttachments([...attachments, audioFile])
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Stop recording after 60 seconds max
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 60000)

      // Store mediaRecorder reference for manual stop
      ;(window as any).currentRecorder = mediaRecorder
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    const mediaRecorder = (window as any).currentRecorder
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex gap-2 items-end">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <Smile className="h-5 w-5" />
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          {/* Attachment preview */}
          {attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-xs text-muted-foreground"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                    className="hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <input
            type="file"
            id="attach-file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              setAttachments([...attachments, ...files])
            }}
            multiple
          />
          <label
            htmlFor="attach-file"
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </label>

          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 hover:bg-muted rounded-lg transition-colors ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading || (!message.trim() && attachments.length === 0)}
            className="p-2 hover:bg-primary/90 bg-primary rounded-lg transition-colors text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
