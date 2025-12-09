"use client"
import { Bell, Share2, Shield, Plus, ChevronUp } from "lucide-react"

const MOOD_SETTINGS = [
  { id: "active", label: "🔥 Active", gradient: "from-red-500 to-orange-500" },
  { id: "chill", label: "🌤️ Chill", gradient: "from-blue-400 to-cyan-400" },
  { id: "debate", label: "🌀 Debate", gradient: "from-purple-500 to-pink-500" },
  { id: "celebration", label: "🎉 Celebration", gradient: "from-yellow-400 to-orange-400" },
  { id: "growing", label: "📈 Growing", gradient: "from-green-500 to-emerald-500" },
  { id: "silent", label: "🌑 Silent", gradient: "from-gray-600 to-gray-800" },
]

const TABS = ["Posts", "Chat", "Media", "Threads", "Events", "Members", "About", "Admin"]

interface CommunityHeaderProps {
  mood: string
  onMoodChange: (mood: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
  onCreatePost?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onOpenRightSidebar?: () => void
}

export default function CommunityHeader({
  mood,
  onMoodChange,
  activeTab,
  onTabChange,
  onCreatePost,
  isCollapsed,
  onToggleCollapse,
  onOpenRightSidebar,
}: CommunityHeaderProps) {
  const activeMoodSetting = MOOD_SETTINGS.find((m) => m.id === mood)

  return (
    <div className="border-b border-border bg-card">
      {/* Top Banner */}
      <div
        className={`bg-gradient-to-r ${activeMoodSetting?.gradient} relative overflow-hidden transition-all ${isCollapsed ? "max-sm:h-12" : "h-32 max-sm:h-24"}`}
      >
        {/* Animated mountain silhouette */}
        {!isCollapsed && (
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 1000 200" className="w-full h-full">
              <polygon
                points="0,150 150,50 250,150 350,40 450,150 550,60 650,150 750,30 850,150 1000,100 1000,200 0,200"
                fill="white"
              />
            </svg>
          </div>
        )}

        {/* Header Content */}
        {!isCollapsed && (
          <div className="absolute inset-0 flex items-end px-6 pb-6 max-sm:px-4 max-sm:pb-4">
            <div>
              <h2 className="text-3xl font-bold text-white max-sm:text-2xl">Tech Hub</h2>
              <p className="text-white/80 text-sm">@tech-hub • 12.5K members</p>
            </div>
          </div>
        )}

        {/* Collapsed Header - Show essentials only */}
        {isCollapsed && (
          <div className="absolute inset-0 flex items-center px-6 max-sm:px-4 justify-between">
            <h2 className="text-lg font-bold text-white">Tech Hub</h2>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-6 flex gap-2 max-sm:top-3 max-sm:right-4">
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all active:scale-95 max-sm:p-1.5">
            <Bell className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all active:scale-95 max-sm:p-1.5 max-sm:hidden">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all active:scale-95 max-sm:p-1.5 max-sm:hidden">
            <Shield className="w-5 h-5" />
          </button>
          <button
            onClick={onCreatePost}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all active:scale-95 max-sm:p-1.5 flex items-center gap-1"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline text-sm font-semibold">Create</span>
          </button>
          <button
            onClick={onToggleCollapse}
            className="sm:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur transition-all active:scale-95"
          >
            <ChevronUp className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* P!!E Atmosphere Mood Selector */}
      {!isCollapsed && (
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-background to-card max-sm:px-4 max-sm:py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase">🏔️ P!!E Atmosphere</h3>
            <div className="text-xs text-muted-foreground">{activeMoodSetting?.label}</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {MOOD_SETTINGS.map((m) => (
              <button
                key={m.id}
                onClick={() => onMoodChange(m.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all transform active:scale-95 ${
                  mood === m.id
                    ? `bg-gradient-to-r ${m.gradient} text-white shadow-lg scale-105`
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="px-6 border-b border-border flex gap-8 max-sm:px-4 max-sm:gap-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab.toLowerCase())}
              className={`py-4 text-sm font-semibold whitespace-nowrap transition-colors relative max-sm:py-3 max-sm:text-xs ${
                activeTab === tab.toLowerCase() ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent slide-underline" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
