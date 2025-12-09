interface TypingIndicatorProps {
  username: string
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  return (
    <div className="animate-messageSlide flex items-center gap-2 py-2 px-3 rounded-lg bg-muted">
      <span className="text-sm text-muted-foreground">{username} is typing</span>
      <div className="flex gap-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  )
}
