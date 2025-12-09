interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export function SkeletonLoader({ className = "h-12 w-full", count = 1 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton rounded-lg ${className}`} />
      ))}
    </div>
  )
}

export function SkeletonPostCard() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    </div>
  )
}

export function SkeletonChatBubble() {
  return (
    <div className="mb-4 flex gap-2">
      <div className="skeleton h-8 w-8 rounded-full" />
      <div className="skeleton h-10 w-40 rounded-lg" />
    </div>
  )
}
