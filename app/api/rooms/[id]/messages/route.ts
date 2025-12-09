
import { type NextRequest, NextResponse } from "next/server"

// GET /api/rooms/[id]/messages - Get room messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Mock messages
    const messages = [
      {
        id: "msg-1",
        roomId: id,
        userId: "current-user",
        username: "alexchen",
        avatar: "/professional-man-avatar.png",
        content: "Ready to play!",
        createdAt: new Date(Date.now() - 60000)
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: messages
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST /api/rooms/[id]/messages - Send room message
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { content, userId } = body
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      roomId: id,
      userId: userId || "current-user",
      username: "currentuser",
      avatar: "/placeholder-user.jpg",
      content,
      createdAt: new Date()
    }
    
    return NextResponse.json({
      success: true,
      data: newMessage
    }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}
