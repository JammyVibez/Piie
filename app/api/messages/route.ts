import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    if (!conversationId) {
      return NextResponse.json({ success: false, error: "Conversation ID required" }, { status: 400 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: decoded.userId }, { user2Id: decoded.userId }],
      },
    })

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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

    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: decoded.userId,
        read: false,
      },
      data: {
        read: true,
        status: "read",
      },
    })

    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      isOwn: msg.senderId === decoded.userId,
      status: msg.status,
      read: msg.read,
      createdAt: msg.createdAt,
      reactions: msg.reactions.map((r) => ({
        emoji: r.emoji,
        user: r.user,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        page,
        limit,
        hasMore: messages.length === limit,
      },
    })
  } catch (error) {
    console.error("[Messages API] Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { conversationId, content, attachments } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ success: false, error: "Conversation ID and content required" }, { status: 400 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: decoded.userId }, { user2Id: decoded.userId }],
      },
    })

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 })
    }

    const receiverId = conversation.user1Id === decoded.userId ? conversation.user2Id : conversation.user1Id

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: decoded.userId,
        receiverId,
        content,
        status: "sent",
        attachments: attachments && attachments.length > 0 ? {
          create: attachments.map((url: string, index: number) => {
            const isAudio = url.includes('audio') || url.includes('.webm')
            const isImage = url.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)/)
            return {
              type: isAudio ? 'audio' : isImage ? 'image' : 'file',
              url,
              name: `attachment-${index + 1}`,
            }
          })
        } : undefined,
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
        attachments: true,
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastUpdated: new Date() },
    })

    await prisma.notification.create({
      data: {
        recipientId: receiverId,
        senderId: decoded.userId,
        type: "message",
        title: "New Message",
        message: "You have a new message",
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        isOwn: true,
        status: message.status,
        createdAt: message.createdAt,
      },
    })
  } catch (error) {
    console.error("[Messages API] Error sending message:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
