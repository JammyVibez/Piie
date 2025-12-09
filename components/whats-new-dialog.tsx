
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Bug, Zap, FileText } from "lucide-react"
import Link from "next/link"

const CURRENT_VERSION = "1.2.0"
const WHATS_NEW_KEY = "whats-new-seen-version"

export function WhatsNewDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seenVersion = localStorage.getItem(WHATS_NEW_KEY)
    if (seenVersion !== CURRENT_VERSION) {
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(WHATS_NEW_KEY, CURRENT_VERSION)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <DialogTitle className="text-2xl">What's New in P!!E</DialogTitle>
          </div>
          <DialogDescription>
            Version {CURRENT_VERSION} - We're constantly improving your experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bug Fixes Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bug className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-500 mb-1">Bug Fixes in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  We're actively working on fixing bugs and improving stability. Thank you for your patience!
                </p>
              </div>
            </div>
          </div>

          {/* Latest Features */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Latest Features</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">NEW</Badge>
                <div>
                  <p className="font-medium">Community Audio Rooms</p>
                  <p className="text-sm text-muted-foreground">Host live audio conversations in your communities</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">NEW</Badge>
                <div>
                  <p className="font-medium">Fusion Posts</p>
                  <p className="text-sm text-muted-foreground">Create multi-layered interactive posts</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">NEW</Badge>
                <div>
                  <p className="font-medium">Ripple Rooms</p>
                  <p className="text-sm text-muted-foreground">24-hour temporary rooms for focused collaboration</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">IMPROVED</Badge>
                <div>
                  <p className="font-medium">Enhanced Chat Experience</p>
                  <p className="text-sm text-muted-foreground">Better messaging with reactions and rich media</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">IMPROVED</Badge>
                <div>
                  <p className="font-medium">Gamification System</p>
                  <p className="text-sm text-muted-foreground">Earn XP, unlock badges, and climb the leaderboard</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Blog Link */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-1">Read the Full Changelog</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Check out our blog for detailed release notes and feature guides
                </p>
                <Link href="/blog">
                  <Button variant="outline" size="sm">
                    Visit Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
