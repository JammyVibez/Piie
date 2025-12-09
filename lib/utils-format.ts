export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Unknown"
  
  try {
    const now = new Date()
    const dateObj = typeof date === "string" ? new Date(date) : date
    
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "Unknown"
    }
    
    const diff = now.getTime() - dateObj.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return dateObj.toLocaleDateString()
  } catch (error) {
    return "Unknown"
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}
