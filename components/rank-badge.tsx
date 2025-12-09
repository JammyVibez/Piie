import type { RarityLevel } from "./types"

interface RankBadgeProps {
  rank: number
  rarity: RarityLevel
}

export function RankBadge({ rank, rarity }: RankBadgeProps) {
  const rarityConfig = {
    common: "bg-slate-600 text-white",
    rare: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white glow-neon",
    epic: "bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-epic",
    legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-black glow-legendary",
  }

  return (
    <div className={`badge-rank ${rarityConfig[rarity]} font-mono`}>
      <span className="text-lg">✦</span>
      <span>{rank}</span>
    </div>
  )
}
