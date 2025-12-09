import type { UserRole } from "./types"

interface RoleBadgeProps {
  role: UserRole | undefined
  size?: "sm" | "md" | "lg"
}

const roleConfig = {
  creator: { icon: "✨", color: "from-purple-500 to-pink-500", label: "Creator" },
  entertainer: { icon: "🎬", color: "from-red-500 to-orange-500", label: "Entertainer" },
  analyst: { icon: "📊", color: "from-blue-500 to-cyan-500", label: "Analyst" },
  educator: { icon: "🎓", color: "from-green-500 to-emerald-500", label: "Educator" },
  explorer: { icon: "🚀", color: "from-yellow-500 to-orange-500", label: "Explorer" },
  mod: { icon: "🛡️", color: "from-slate-500 to-gray-600", label: "Moderator" },
  admin: { icon: "👑", color: "from-red-600 to-pink-600", label: "Admin" },
  support: { icon: "🤝", color: "from-indigo-500 to-purple-500", label: "Support" },
  contributor: { icon: "🤲", color: "from-teal-500 to-green-500", label: "Contributor" },
  helper: { icon: "🆘", color: "from-amber-500 to-orange-500", label: "Helper" },
  developer: { icon: "💻", color: "from-blue-600 to-cyan-600", label: "Developer" },
}

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  if (!role || !roleConfig[role as keyof typeof roleConfig]) {
    return null
  }

  const config = roleConfig[role as keyof typeof roleConfig]
  const sizeClass = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-base",
    lg: "w-10 h-10 text-lg",
  }

  return (
    <div
      className={`${sizeClass[size]} rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-md border border-white/20`}
      title={config.label}
    >
      {config.icon}
    </div>
  )
}
