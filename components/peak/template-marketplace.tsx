"use client"

import { useState } from "react"
import { Download, Star, Users, X } from "lucide-react"

interface TemplateMarketplaceProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: any) => void
}

const TEMPLATES = [
  {
    id: 1,
    name: "Weekly Standup Poll",
    category: "Poll",
    icon: "📋",
    description: "Quick poll to gather team updates",
    downloads: 1234,
    rating: 4.8,
    author: "Sarah Chen",
    preview: "What did you accomplish this week?",
  },
  {
    id: 2,
    name: "Event Announcement",
    category: "Event",
    icon: "📢",
    description: "Professional event announcement template",
    downloads: 2156,
    rating: 4.9,
    author: "Design Team",
    preview: "Join us for an amazing event!",
  },
  {
    id: 3,
    name: "Quick Question",
    category: "Question",
    icon: "❓",
    description: "Ask the community quick questions",
    downloads: 3421,
    rating: 4.7,
    author: "Community",
    preview: "Quick question for the community...",
  },
  {
    id: 4,
    name: "Challenge Prompt",
    category: "Challenge",
    icon: "🎯",
    description: "Launch community challenges",
    downloads: 892,
    rating: 4.6,
    author: "Marcus Dev",
    preview: "This week's challenge is...",
  },
  {
    id: 5,
    name: "Knowledge Share",
    category: "Article",
    icon: "📚",
    description: "Share tips and best practices",
    downloads: 1567,
    rating: 4.9,
    author: "Alex Designer",
    preview: "Today I learned...",
  },
  {
    id: 6,
    name: "Feedback Request",
    category: "Poll",
    icon: "💭",
    description: "Gather community feedback",
    downloads: 2341,
    rating: 4.8,
    author: "Product Team",
    preview: "We'd love your feedback on...",
  },
]

export default function TemplateMarketplace({ isOpen, onClose, onSelectTemplate }: TemplateMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "Poll", "Event", "Article", "Challenge", "Question"]
  const filteredTemplates =
    selectedCategory === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === selectedCategory)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Template Marketplace</h2>
            <p className="text-sm text-muted-foreground">Choose a template to get started</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Categories */}
        <div className="border-b border-border px-6 py-4 flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-muted rounded-lg p-4 hover:border-primary/50 hover:shadow-lg transition-all border border-border cursor-pointer group"
                onClick={() => {
                  onSelectTemplate(template)
                  onClose()
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.category}</p>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3">{template.description}</p>
                <p className="text-xs text-muted-foreground italic mb-3">"{template.preview}"</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {template.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {template.rating}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    by {template.author}
                  </div>
                </div>

                <button className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
