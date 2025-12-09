"use client"

import { useState } from "react"
import { Settings, Save, X, Globe, Shield, Users, Bell, Palette } from "lucide-react"

interface CommunitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommunitySettings({ isOpen, onClose }: CommunitySettingsProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    name: "Tech Hub",
    description: "A thriving community for tech enthusiasts",
    visibility: "public",
    allowJoin: true,
    moderation: "strict",
    theme: "peak",
    notifications: true,
  })

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "members", label: "Members", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "theme", label: "Theme", icon: Palette },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Community Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Community Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none resize-none h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Visibility</label>
                <select
                  value={settings.visibility}
                  onChange={(e) => setSettings({ ...settings, visibility: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.allowJoin}
                  onChange={(e) => setSettings({ ...settings, allowJoin: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">Allow anyone to join</span>
              </label>
            </div>
          )}

          {activeTab === "moderation" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Moderation Level</label>
                <select
                  value={settings.moderation}
                  onChange={(e) => setSettings({ ...settings, moderation: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
                >
                  <option value="strict">Strict (All posts reviewed)</option>
                  <option value="moderate">Moderate (Flag certain content)</option>
                  <option value="lenient">Lenient (Community-driven)</option>
                </select>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Manage community moderators and set content guidelines in the Moderation panel.
                </p>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">Community Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "peak", name: "P!!E", color: "from-emerald-500 to-teal-500" },
                    { id: "ocean", name: "Ocean", color: "from-blue-500 to-cyan-500" },
                    { id: "forest", name: "Forest", color: "from-green-600 to-emerald-600" },
                    { id: "sakura", name: "Sakura", color: "from-pink-500 to-rose-500" },
                    { id: "gojo", name: "Gojo", color: "from-purple-500 to-blue-500" },
                    { id: "dragon", name: "Dragon", color: "from-red-500 to-orange-500" },
                    { id: "sunset", name: "Sunset", color: "from-orange-500 to-purple-500" },
                    { id: "mint", name: "Mint", color: "from-emerald-400 to-cyan-400" },
                    { id: "lavender", name: "Lavender", color: "from-purple-400 to-pink-400" },
                    { id: "amber", name: "Amber", color: "from-amber-500 to-yellow-500" },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSettings({ ...settings, theme: theme.id })}
                      className={`p-4 rounded-lg transition-all border-2 ${
                        settings.theme === theme.id ? "border-primary" : "border-transparent hover:border-muted"
                      }`}
                    >
                      <div className={`w-full h-12 rounded bg-gradient-to-r ${theme.color} mb-2`} />
                      <p className="text-xs font-semibold">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">Enable notifications</span>
              </label>
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">New posts in community</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Member mentions</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Upcoming events</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage community members, roles, and permissions in the Members section.
              </p>
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all">
                Manage Moderators
              </button>
              <button className="w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all">
                Ban Members
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-muted transition-all text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
