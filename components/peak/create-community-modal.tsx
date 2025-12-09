"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface CreateCommunityModalProps {
  onClose: () => void
  onCreate?: (community: {
    name: string
    description: string
    category: string
    isPublic: boolean
  }) => void
  onCreateCommunity?: (community: {
    name: string
    description: string
    category: string
    isPrivate: boolean
  }) => void
}

export default function CreateCommunityModal({ onClose, onCreate, onCreateCommunity }: CreateCommunityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    isPrivate: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      try {
        // Try to get token from localStorage with correct key
        let token = localStorage.getItem('auth_token')
        
        // If not in localStorage, try alternate key
        if (!token) {
          token = localStorage.getItem('token')
        }
        
        // If still not found, try to get from cookies
        if (!token) {
          const cookies = document.cookie.split(';')
          const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token=')) || 
                              cookies.find(c => c.trim().startsWith('token='))
          if (tokenCookie) {
            token = tokenCookie.split('=')[1]
          }
        }
        
        if (!token) {
          alert('Please log in to create a community')
          window.location.href = '/auth/login'
          return
        }

        const response = await fetch('/api/communities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            isPublic: !formData.isPrivate
          })
        })

        const result = await response.json()
        
        if (result.success) {
          if (onCreate) {
            onCreate({
              name: formData.name,
              description: formData.description,
              category: formData.category,
              isPublic: !formData.isPrivate,
            })
          } else if (onCreateCommunity) {
            onCreateCommunity(formData)
          }
          onClose()
        } else {
          if (response.status === 401) {
            alert('Session expired. Please log in again.')
            window.location.href = '/auth/login'
          } else {
            alert(result.error || 'Failed to create community')
          }
        }
      } catch (error) {
        console.error('Error creating community:', error)
        alert('Failed to create community')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl pop-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Create Community</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Community Name */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Community Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Tech Builders, Design Hub"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is your community about?"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-24"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="general">General</option>
              <option value="tech">Technology</option>
              <option value="creative">Creative</option>
              <option value="business">Business</option>
              <option value="gaming">Gaming</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <input
              type="checkbox"
              id="private"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="private" className="text-sm font-semibold cursor-pointer flex-1">
              Make this community private
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all active:scale-95"
            >
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
