"use client"

import { SearchBar } from "@/components/search-bar"
import { NotificationsPanel } from "@/components/notifications-panel"
import { Button } from "@/components/ui/button"
import { Sparkles, Home } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="hidden md:flex items-center justify-between gap-4 h-16 bg-card border-b border-border/50 px-6 sticky top-0 z-30">
      <div className="flex-1">
        <SearchBar />
      </div>
      <div className="flex items-center gap-6">
        <Link href="/landing" className="flex items-center gap-2 font-bold text-xl">
          <Sparkles className="text-primary" size={24} />
          <span>P!!e</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <Home size={18} />
              Home
            </Button>
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NotificationsPanel />
      </div>
    </header>
  )
}