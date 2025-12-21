import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

// GET /api/rooms/[id]/messages - Get room messages
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await context.params
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Verify user is a member (optional for public rooms)
    if (userId) {
      const member = await prisma.roomMember.findUnique({
        where: {
          roomId_userId: {
            roomId,
            userId,
          },
        },
      })

      // Allow viewing messages even if not a member for public rooms
    }

    const messages = await prisma.roomMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
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
      take: 100,
    })

    return NextResponse.json({
      success: true,
      data: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        user: msg.author,
        createdAt: msg.createdAt,
      })),
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
    const { id: roomId } = await context.params
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { content, anonymousName } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Message content required" }, { status: 400 })
    }

    // Check if user is a member
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: decoded.userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ success: false, error: "Not a member of this room" }, { status: 403 })
    }

    // Check if room has anonymous mode
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { anonymousMode: true },
    })

    // Create message
    const message = await prisma.roomMessage.create({
      data: {
        roomId,
        authorId: decoded.userId,
        content: content.trim(),
      },
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

    // For anonymous rooms, use the provided anonymous name
    const displayName = room?.anonymousMode && anonymousName ? anonymousName : null

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        user: message.author,
        anonymousName: displayName,
        createdAt: message.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}
