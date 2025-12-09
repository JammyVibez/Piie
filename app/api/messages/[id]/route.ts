import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { id: messageId } = await params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        isOwn: message.senderId === decoded.userId,
        status: message.status,
        read: message.read,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        reactions: message.reactions.map((r) => ({
          emoji: r.emoji,
          user: r.user,
        })),
      },
    })
  } catch (error) {
    console.error("[Messages API] Error fetching message:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch message" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { id: messageId } = await params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Message content required" }, { status: 400 })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    if (message.senderId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "You can only edit your own messages" }, { status: 403 })
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMessage.id,
        content: updatedMessage.content,
        sender: updatedMessage.sender,
        isOwn: true,
        isEdited: updatedMessage.isEdited,
        status: updatedMessage.status,
        updatedAt: updatedMessage.updatedAt,
      },
    })
  } catch (error) {
    console.error("[Messages API] Error editing message:", error)
    return NextResponse.json({ success: false, error: "Failed to edit message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { id: messageId } = await params

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    if (message.senderId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "You can only delete your own messages" }, { status: 403 })
    }

    await prisma.messageReaction.deleteMany({
      where: { messageId },
    })

    await prisma.message.delete({
      where: { id: messageId },
    })

    return NextResponse.json({
      success: true,
      data: { deleted: true, messageId },
    })
  } catch (error) {
    console.error("[Messages API] Error deleting message:", error)
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 })
  }
}
