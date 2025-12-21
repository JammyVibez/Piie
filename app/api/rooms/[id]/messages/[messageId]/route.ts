import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id: roomId, messageId } = await params

    const message = await prisma.roomMessage.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    if (!message || message.roomId !== roomId) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    // Check if room is anonymous
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { anonymousMode: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        user: message.author,
        anonymousName: room?.anonymousMode ? "Anonymous" : null,
        createdAt: message.createdAt,
      },
    })
  } catch (error) {
    console.error("[Room Message API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch message" }, { status: 500 })
  }
}

