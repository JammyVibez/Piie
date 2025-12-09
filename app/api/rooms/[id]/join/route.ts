
import { type NextRequest, NextResponse } from "next/server"

// POST /api/rooms/[id]/join - Join a room
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { userId, team } = body
    
    // Mock user
    const user = {
      id: userId || "current-user",
      name: "Current User",
      username: "currentuser",
      avatar: "/placeholder-user.jpg",
      isOnline: true
    }
    
    // Mock: Add user to room members
    // In real implementation, update database
    
    return NextResponse.json({
      success: true,
      message: "Successfully joined room",
      data: {
        userId: user.id,
        team: team || "Team A",
        joinedAt: new Date()
      }
    })
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to join room" },
      { status: 500 }
    )
  }
}
