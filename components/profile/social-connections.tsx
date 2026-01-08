"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Github, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Globe, 
  Link as LinkIcon,
  Check,
  X,
  Plus,
  Edit
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface SocialConnection {
  id: string
  platform: string
  username: string
  url: string
  isConnected: boolean
}

interface SocialConnectionsProps {
  initialConnections?: SocialConnection[]
  isOwnProfile?: boolean
}

const PLATFORMS = [
  { id: "github", name: "GitHub", icon: Github, color: "hover:text-white" },
  { id: "twitter", name: "Twitter", icon: Twitter, color: "hover:text-blue-400" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "hover:text-pink-500" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "hover:text-blue-600" },
  { id: "website", name: "Website", icon: Globe, color: "hover:text-green-400" },
]

export function SocialConnections({ 
  initialConnections = [], 
  isOwnProfile = false 
}: SocialConnectionsProps) {
  const [connections, setConnections] = useState<SocialConnection[]>(initialConnections)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleConnect = (platformId: string) => {
    if (!isOwnProfile) return
    
    // In a real app, this would open an OAuth flow or a modal to input details
    // For now, we'll just simulate adding a connection
    const newConnection: SocialConnection = {
      id: Math.random().toString(36).substring(7),
      platform: platformId,
      username: "",
      url: "",
      isConnected: true
    }
    
    setConnections([...connections, newConnection])
    setEditingId(newConnection.id)
    toast.info(`Enter your ${PLATFORMS.find(p => p.id === platformId)?.name} username or URL`)
  }

  const handleSave = (id: string) => {
    setConnections(connections.map(c => 
      c.id === id ? { ...c, username: editValue, url: editValue } : c
    ))
    setEditingId(null)
    setEditValue("")
    toast.success("Social link updated")
  }

  const handleDisconnect = (id: string) => {
    setConnections(connections.filter(c => c.id !== id))
    toast.success("Social link removed")
  }

  return (
    <Card className="w-full bg-background/50 backdrop-blur-md border-primary/10 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          Connect & Socials
        </CardTitle>
        <CardDescription>
          Connect your social accounts to display them on your profile.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Active Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => {
            const platform = PLATFORMS.find(p => p.id === conn.platform) || PLATFORMS[4]
            const Icon = platform.icon
            
            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-background/80 ${platform.color} transition-colors`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {editingId === conn.id ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Username or URL"
                      className="h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{platform.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {conn.username || "Connected"}
                      </span>
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === conn.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          onClick={() => handleSave(conn.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingId(conn.id)
                            setEditValue(conn.username || "")
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDisconnect(conn.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Add New Connection */}
        {isOwnProfile && (
          <div className="pt-4 border-t border-border/50">
            <Label className="text-xs font-semibold text-muted-foreground uppercase mb-3 block">
              Add Connection
            </Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.filter(p => !connections.some(c => c.platform === p.id)).map((platform) => {
                const Icon = platform.icon
                return (
                  <Button
                    key={platform.id}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                    onClick={() => handleConnect(platform.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {platform.name}
                    <Plus className="w-3 h-3 ml-1 opacity-50" />
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
