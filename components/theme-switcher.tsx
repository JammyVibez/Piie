"use client"

import { useState, useEffect } from "react"
import { Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const THEMES = [
  { id: "peakit", label: "P!!E Default", colors: "purple-cyan-gold" },
  { id: "gojo", label: "Gojo Theme", colors: "blue-white-black" },
  { id: "ocean", label: "Ocean Theme", colors: "teal-blue-aqua" },
  { id: "forest", label: "Forest Theme", colors: "green-emerald-lime" },
  { id: "sakura", label: "Sakura Theme", colors: "pink-rose-red" },
  { id: "dragon", label: "Dragon Theme", colors: "red-orange-gold" },
  { id: "sunset", label: "Sunset Theme", colors: "orange-purple-pink" },
  { id: "mint", label: "Mint Theme", colors: "mint-aqua-green" },
  { id: "lavender", label: "Lavender Theme", colors: "purple-lavender-violet" },
  { id: "amber", label: "Amber Theme", colors: "gold-amber-yellow" },
  { id: "neon", label: "Neon Theme", colors: "neon-pink-cyan" },
  { id: "midnight", label: "Midnight Theme", colors: "deep-blue-purple" },
  { id: "ice", label: "Ice Theme", colors: "frost-blue-white" },
  { id: "coffee", label: "Coffee Theme", colors: "brown-cream-mocha" },
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("peakit")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("peakit-theme") || "peakit"
    setCurrentTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
  }, [])

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    localStorage.setItem("peakit-theme", themeId)
    document.documentElement.setAttribute("data-theme", themeId)
  }

  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-primary/15 transition-colors cursor-pointer" title="Switch Theme">
          <Palette size={20} className="text-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={`cursor-pointer ${currentTheme === t.id ? "bg-primary/15 text-primary" : ""}`}
          >
            <div className="flex items-center gap-2 w-full">
              <div className={`w-3 h-3 rounded-full theme-indicator-${t.id}`} />
              <span>{t.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
