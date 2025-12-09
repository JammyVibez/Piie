
import { type NextRequest, NextResponse } from "next/server"

// POST /api/rooms/[id]/leave - Leave a room
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { userId } = body
    
    // Mock: Remove user from room members
    // In real implementation, update database
    
    return NextResponse.json({
      success: true,
      message: "Successfully left room",
      data: {
        userId: userId || "current-user",
        leftAt: new Date()
      }
    })
  } catch (error) {
    console.error("Error leaving room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to leave room" },
      { status: 500 }
    )
  }
}
