"use client"

const BADGES = [
  {
    id: 1,
    name: "Summit Climber",
    icon: "🏔️",
    description: "Reach 100 posts",
    progress: 87,
    total: 100,
    rarity: "Common",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Trail Guide",
    icon: "🧭",
    description: "Help 50 community members",
    progress: 42,
    total: 50,
    rarity: "Uncommon",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 3,
    name: "P!!E Star",
    icon: "⭐",
    description: "Get 1000 reactions on posts",
    progress: 756,
    total: 1000,
    rarity: "Rare",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 4,
    name: "Avalanche",
    icon: "🌪️",
    description: "Start a viral thread (500+ replies)",
    progress: 12,
    total: 1,
    rarity: "Epic",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 5,
    name: "Explorer",
    icon: "🔭",
    description: "Participate in 5 different communities",
    progress: 3,
    total: 5,
    rarity: "Uncommon",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    name: "Founder",
    icon: "👑",
    description: "Create a community with 100+ members",
    progress: 0,
    total: 1,
    rarity: "Legendary",
    color: "from-red-500 to-yellow-500",
  },
]

const POINTS_BREAKDOWN = [
  { action: "Create post", points: 10 },
  { action: "Get reaction", points: 1 },
  { action: "Write comment", points: 5 },
  { action: "Help someone", points: 25 },
  { action: "Start event", points: 50 },
  { action: "Earn badge", points: 100 },
]

export default function BadgesSystem() {
  return (
    <div className="space-y-8 p-6">
      {/* Points Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Current Points</p>
            <p className="text-3xl font-bold mt-2">2,450</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Level</p>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Next Level</p>
            <p className="text-lg font-bold mt-2">2,850 pts</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: "65%" }} />
        </div>
      </div>

      {/* Points Breakdown */}
      <div>
        <h3 className="font-bold text-lg mb-4">How to Earn Points</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POINTS_BREAKDOWN.map((item, idx) => (
            <div key={idx} className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-foreground mb-2">{item.action}</p>
              <p className="text-2xl font-bold text-primary">+{item.points}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-bold text-lg mb-4">Your Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BADGES.map((badge) => {
            const percentage = (badge.progress / badge.total) * 100
            const isEarned = badge.progress >= badge.total

            return (
              <div
                key={badge.id}
                className={`rounded-lg p-4 border transition-all ${
                  isEarned ? `bg-gradient-to-br ${badge.color} border-transparent text-white` : "bg-muted border-border"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{badge.name}</h4>
                    <p className={`text-xs ${isEarned ? "text-white/80" : "text-muted-foreground"}`}>
                      {badge.description}
                    </p>
                    <span
                      className={`text-xs font-semibold inline-block mt-1 px-2 py-1 rounded ${
                        isEarned ? "bg-white/20" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {badge.rarity}
                    </span>
                  </div>
                </div>

                {!isEarned && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {badge.progress}/{badge.total}
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {isEarned && <div className="text-center text-sm font-semibold mt-2">✓ Earned</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
