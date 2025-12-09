
import { type NextRequest, NextResponse } from "next/server"

// GET /api/rooms/[id]/highlights - Get room highlights
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const highlights = [
      {
        id: "h1",
        roomId: id,
        title: "Epic Moment",
        thumbnail: "/gaming-setup-pc-rgb.jpg",
        duration: 15,
        userId: "current-user",
        likes: 42,
        createdAt: new Date(Date.now() - 300000)
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: highlights
    })
  } catch (error) {
    console.error("Error fetching highlights:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch highlights" },
      { status: 500 }
    )
  }
}

// POST /api/rooms/[id]/highlights - Create highlight
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, duration, thumbnail } = body
    
    const newHighlight = {
      id: `h-${Date.now()}`,
      roomId: id,
      title,
      thumbnail: thumbnail || "/placeholder.jpg",
      duration: duration || 10,
      userId: "current-user",
      likes: 0,
      createdAt: new Date()
    }
    
    return NextResponse.json({
      success: true,
      data: newHighlight
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating highlight:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create highlight" },
      { status: 500 }
    )
  }
}
