"use client"

import React, { useState } from "react"
import { Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface MessageSearchProps {
  onSearch: (query: string) => void
  isOpen: boolean
  onClose: () => void
}

export function MessageSearch({ onSearch, isOpen, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)

  React.useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  if (!isOpen) return null

  return (
    <div className="pop-in flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search messages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      <button onClick={onClose} className="p-1 hover:bg-background rounded transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
