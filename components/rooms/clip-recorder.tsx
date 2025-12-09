"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Video, X, Upload } from "lucide-react"

interface ClipRecorderProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (data: any) => void
}

export function ClipRecorder({ isOpen, onClose, onUpload }: ClipRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedClip, setRecordedClip] = useState<Blob | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleStartRecord = () => {
    setIsRecording(true)
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false)
      setRecordedClip(new Blob(["video data"], { type: "video/webm" }))
    }, 3000)
  }

  const handleUpload = () => {
    if (!recordedClip || !title) return
    onUpload?.({
      clip: recordedClip,
      title,
      description,
    })
    setTitle("")
    setDescription("")
    setRecordedClip(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl p-6 slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Record Clip</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Recording Area */}
        <div className="bg-black rounded-xl p-4 mb-4 aspect-video flex items-center justify-center relative overflow-hidden">
          {isRecording ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse" />
              </div>
              <p className="text-white font-bold">Recording...</p>
            </div>
          ) : recordedClip ? (
            <div className="text-center">
              <Video className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-white text-sm">Clip ready to upload</p>
            </div>
          ) : (
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No clip recorded</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!recordedClip ? (
          <Button onClick={handleStartRecord} disabled={isRecording} className="w-full mb-4 rounded-lg">
            {isRecording ? "Recording (3s)..." : "Start Recording"}
          </Button>
        ) : (
          <>
            {/* Upload Form */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Clip Title</label>
                <input
                  type="text"
                  placeholder="e.g., Epic Clutch Play"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Description</label>
                <textarea
                  placeholder="Optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none h-16"
                />
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setRecordedClip(null)
                  setTitle("")
                  setDescription("")
                }}
              >
                Retake
              </Button>
              <Button onClick={handleUpload} disabled={!title} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </>
        )}

        {/* Close button */}
        <Button variant="ghost" className="w-full mt-4 bg-transparent" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
