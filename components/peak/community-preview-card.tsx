"use client"

interface CommunityPreviewCardProps {
  community: {
    id: string
    name: string
    description?: string
    membersCount?: number
    postsCount?: number
    recentPosts?: Array<{ author: string; text: string }>
    onlineMembers?: string[]
  }
  onJoin?: () => void
}

export default function CommunityPreviewCard({ community, onJoin }: CommunityPreviewCardProps) {
  const recentPosts = community.recentPosts || []
  const onlineMembers = community.onlineMembers || []

  return (
    <div className="absolute left-full ml-2 top-0 w-48 bg-card border border-border rounded-lg p-3 shadow-lg z-50 pop-in">
      <div className="text-xs font-semibold mb-2">{community.name}</div>

      {community.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{community.description}</p>
      )}

      {recentPosts.length > 0 && (
        <div className="mb-3 pb-3 border-b border-border">
          {recentPosts.slice(0, 2).map((post, i) => (
            <div key={i} className="text-xs mb-1">
              <span className="font-semibold">{post.author}:</span> {post.text}
            </div>
          ))}
        </div>
      )}

      {onlineMembers.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-semibold">Online:</span>
          <div className="flex -space-x-1">
            {onlineMembers.slice(0, 5).map((member, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs flex items-center justify-center border border-card font-bold"
              >
                {member[0]}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {community.membersCount !== undefined && (
          <span>{community.membersCount} members</span>
        )}
        {community.postsCount !== undefined && (
          <span>{community.postsCount} posts</span>
        )}
      </div>

      <button 
        onClick={onJoin}
        className="w-full text-xs py-1 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition-all"
      >
        Join
      </button>
    </div>
  )
}
