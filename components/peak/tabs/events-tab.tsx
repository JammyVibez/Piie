"use client"

import { useState } from "react"
import { Calendar, Clock, Users, MapPin, Plus } from "lucide-react"
import EventBuilder from "../event-builder"

interface Event {
  id: number
  title: string
  date: string
  time: string
  host: string
  icon: string
  attendees: number
  location: string
  description: string
  type?: "online" | "inperson" | "hybrid"
}

const INITIAL_EVENTS: Event[] = [
  {
    id: 1,
    title: "Web Development Livestream",
    date: "Dec 8, 2024",
    time: "4:00 PM - 5:30 PM",
    host: "Sarah Chen",
    icon: "🎬",
    attendees: 342,
    location: "Online",
    description: "Building a real-time collaborative tool with Next.js",
    type: "online",
  },
  {
    id: 2,
    title: "Design Challenge Kickoff",
    date: "Dec 10, 2024",
    time: "10:00 AM - 11:00 AM",
    host: "Design Team",
    icon: "🎨",
    attendees: 156,
    location: "Online",
    description: "Create a unique P!!E community theme",
    type: "online",
  },
  {
    id: 3,
    title: "Q&A with P!!E Team",
    date: "Dec 15, 2024",
    time: "6:00 PM - 7:00 PM",
    host: "Dev Team",
    icon: "🎤",
    attendees: 523,
    location: "Online",
    description: "Ask anything about P!!E features and roadmap",
    type: "online",
  },
  {
    id: 4,
    title: "Community Meetup",
    date: "Dec 20, 2024",
    time: "2:00 PM - 5:00 PM",
    host: "Community Lead",
    icon: "👥",
    attendees: 89,
    location: "San Francisco, CA",
    description: "Network and celebrate our community milestones",
    type: "inperson",
  },
]

export default function EventsTab() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS)
  const [showEventBuilder, setShowEventBuilder] = useState(false)
  const [userAttendingEvents, setUserAttendingEvents] = useState<number[]>([])

  const handleCreateEvent = (eventData: any) => {
    const newEvent: Event = {
      id: eventData.id,
      title: eventData.title,
      date: eventData.date,
      time: eventData.time,
      host: "You",
      icon: eventData.icon,
      attendees: 1,
      location: eventData.location || "Online",
      description: eventData.description,
      type: eventData.type,
    }
    setEvents([newEvent, ...events])
  }

  const handleAttendEvent = (eventId: number) => {
    if (!userAttendingEvents.includes(eventId)) {
      setUserAttendingEvents([...userAttendingEvents, eventId])
      setEvents(events.map((event) => (event.id === eventId ? { ...event, attendees: event.attendees + 1 } : event)))
    }
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Community Events</h2>
        <button
          onClick={() => setShowEventBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No events yet</p>
          <button
            onClick={() => setShowEventBuilder(true)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl flex-shrink-0">
                  {event.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors mb-1">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">Hosted by {event.host}</p>
                </div>

                <button
                  onClick={() => handleAttendEvent(event.id)}
                  disabled={userAttendingEvents.includes(event.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all active:scale-95 whitespace-nowrap ${
                    userAttendingEvents.includes(event.id)
                      ? "bg-muted text-foreground cursor-default"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {userAttendingEvents.includes(event.id) ? "Attending" : "Join Event"}
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground">{event.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Event Builder Modal */}
      <EventBuilder
        isOpen={showEventBuilder}
        onClose={() => setShowEventBuilder(false)}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  )
}
