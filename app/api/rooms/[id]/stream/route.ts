
import { type NextRequest, NextResponse } from "next/server"

// POST /api/rooms/[id]/stream - Start/stop stream
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { action, streamUrl } = body
    
    if (action === "start") {
      return NextResponse.json({
        success: true,
        message: "Stream started",
        data: {
          isStreaming: true,
          streamUrl: streamUrl || `https://stream.example.com/${id}`,
          startedAt: new Date()
        }
      })
    } else if (action === "stop") {
      return NextResponse.json({
        success: true,
        message: "Stream stopped",
        data: {
          isStreaming: false,
          stoppedAt: new Date()
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error controlling stream:", error)
    return NextResponse.json(
      { success: false, error: "Failed to control stream" },
      { status: 500 }
    )
  }
}
