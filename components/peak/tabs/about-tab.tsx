"use client"

import { Users, TrendingUp, Calendar, LinkIcon } from "lucide-react"

export default function AboutTab() {
  return (
    <div className="p-6 max-w-2xl">
      {/* Community Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">About Tech Hub</h2>
        <p className="text-foreground text-lg leading-relaxed mb-4">
          Welcome to the Tech Hub - a thriving community where developers, designers, and tech enthusiasts gather to
          share knowledge, build incredible projects, and grow together.
        </p>
        <p className="text-muted-foreground text-base leading-relaxed">
          We believe in the power of collaboration and open-source thinking. Whether you're just starting your tech
          journey or you're a seasoned professional, there's a place for you here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Members", value: "12.5K", icon: Users },
          { label: "Posts", value: "2.3K", icon: TrendingUp },
          { label: "Founded", value: "1 year ago", icon: Calendar },
          { label: "Growth", value: "+45%", icon: TrendingUp },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-muted rounded-lg p-4 text-center">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Guidelines */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Be respectful and constructive in all interactions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Share knowledge and help others grow</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>No spam, self-promotion without value</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>Keep discussions relevant to technology</span>
          </li>
        </ul>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Community Rules", icon: LinkIcon },
          { label: "Report Content", icon: LinkIcon },
          { label: "Contact Mods", icon: LinkIcon },
          { label: "Subscribe to Newsletter", icon: LinkIcon },
        ].map((link) => (
          <button
            key={link.label}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-all"
          >
            <link.icon className="w-4 h-4" />
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}
