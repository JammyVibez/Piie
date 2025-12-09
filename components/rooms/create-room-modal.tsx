"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RoomType, RoomPrivacy } from "@/lib/types"
import { GAME_LIST, getRoomTypeLabel } from "@/lib/room-utils"
import { X } from "lucide-react"

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: any) => void
}

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [roomType, setRoomType] = useState<RoomType>("game")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [privacy, setPrivacy] = useState<RoomPrivacy>("public")
  const [maxMembers, setMaxMembers] = useState(4)
  const [selectedGame, setSelectedGame] = useState("ff")
  const [difficulty, setDifficulty] = useState<"casual" | "competitive" | "practice">("casual")

  const handleCreate = () => {
    onCreate({
      roomType,
      title,
      description,
      privacy,
      maxMembers,
      selectedGame,
      difficulty,
    })
    setTitle("")
    setDescription("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-3xl p-6 slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create Room</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Room Type */}
          <div>
            <Label>Room Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["game", "post_sharing", "discussion", "collab"] as RoomType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRoomType(type)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    roomType === type ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {getRoomTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Room Title</Label>
            <Input
              id="title"
              placeholder="e.g., Free Fire Squad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Description (Optional)</Label>
            <textarea
              id="desc"
              placeholder="What's this room about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground mt-2 text-sm resize-none h-16"
            />
          </div>

          {/* Game Selection (if game room) */}
          {roomType === "game" && (
            <div>
              <Label>Select Game</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {GAME_LIST.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedGame === game.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="mr-1">{game.icon}</span>
                    {game.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty (if game room) */}
          {roomType === "game" && (
            <div>
              <Label>Difficulty</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(["casual", "competitive", "practice"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      difficulty === diff ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy */}
          <div>
            <Label>Privacy</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["public", "private", "friends_only"] as RoomPrivacy[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrivacy(p)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    privacy === p ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Max Members */}
          <div>
            <Label htmlFor="max">Max Members</Label>
            <div className="flex gap-2 mt-2">
              {[2, 4, 8, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => setMaxMembers(num)}
                  className={`flex-1 p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    maxMembers === num ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 pt-6 border-t border-border">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title} className="flex-1">
            Create Room
          </Button>
        </div>
      </div>
    </div>
  )
}
