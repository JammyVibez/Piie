"use client"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Users } from "lucide-react"

interface EventBuilderProps {
  isOpen: boolean
  onClose: () => void
  onCreateEvent: (event: any) => void
}

export default function EventBuilder({ isOpen, onClose, onCreateEvent }: EventBuilderProps) {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    location: "",
    type: "online",
    maxAttendees: "",
    icon: "📅",
  })

  const handleCreateEvent = () => {
    if (!eventData.title || !eventData.date) return

    const event = {
      id: Date.now(),
      ...eventData,
      attendees: 0,
      host: "You",
    }

    onCreateEvent(event)
    setEventData({
      title: "",
      description: "",
      date: "",
      time: "",
      endTime: "",
      location: "",
      type: "online",
      maxAttendees: "",
      icon: "📅",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Event Title</label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="Enter event title"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Event description..."
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none resize-none h-24"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </label>
              <input
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <div className="flex gap-3">
              {[
                { id: "online", label: "Online", icon: "🌐" },
                { id: "inperson", label: "In-Person", icon: "📍" },
                { id: "hybrid", label: "Hybrid", icon: "🔀" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setEventData({ ...eventData, type: type.id })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    eventData.type === type.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {eventData.type !== "online" && (
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                placeholder="Enter location"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
              />
            </div>
          )}

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Max Attendees (Optional)
            </label>
            <input
              type="number"
              value={eventData.maxAttendees}
              onChange={(e) => setEventData({ ...eventData, maxAttendees: e.target.value })}
              placeholder="Leave empty for unlimited"
              className="w-full px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Event Icon */}
          <div>
            <label className="block text-sm font-semibold mb-2">Event Icon</label>
            <div className="flex gap-2 flex-wrap">
              {["📅", "🎬", "🎨", "🎤", "🎯", "👥", "🚀", "💡"].map((icon) => (
                <button
                  key={icon}
                  onClick={() => setEventData({ ...eventData, icon })}
                  className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                    eventData.icon === icon ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
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
            onClick={handleCreateEvent}
            disabled={!eventData.title || !eventData.date}
            className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  )
}
