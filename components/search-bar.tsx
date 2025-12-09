"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search posts, users, communities..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
          className="pl-10 pr-8 h-10 bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && search && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50">
          <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
            {["User 1", "User 2", "Community Search", "Trending Tag"].map((item, i) => (
              <div key={i} className="p-2 rounded hover:bg-primary/10 cursor-pointer transition-colors text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
