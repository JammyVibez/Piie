
import { type NextRequest, NextResponse } from "next/server"

// POST /api/rooms/[id]/ready - Toggle player ready state
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { userId, readyState } = body
    
    return NextResponse.json({
      success: true,
      message: "Ready state updated",
      data: {
        userId: userId || "current-user",
        readyState: readyState !== false,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error("Error updating ready state:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update ready state" },
      { status: 500 }
    )
  }
}
