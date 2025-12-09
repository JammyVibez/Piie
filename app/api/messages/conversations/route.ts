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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: decoded.userId }, { user2Id: decoded.userId }],
      },
      orderBy: { lastUpdated: "desc" },
      skip,
      take: limit,
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            status: true,
            read: true,
          },
        },
      },
    })

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: decoded.userId,
        read: false,
      },
    })

    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === decoded.userId ? conv.user2 : conv.user1
      const lastMessage = conv.messages[0]
      const unreadMessagesInConv = conv.messages.filter(msg => msg.receiverId === decoded.userId && !msg.read).length;

      return {
        id: conv.id,
        otherUser,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isOwn: lastMessage.senderId === decoded.userId,
              status: lastMessage.status,
            }
          : null,
        isPinned: conv.isPinned,
        isMuted: conv.isMuted,
        isArchived: conv.isArchived,
        unreadCount: unreadMessagesInConv,
        lastUpdated: conv.lastMessageAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        conversations: formattedConversations,
        unreadCount,
        page,
        limit,
        hasMore: conversations.length === limit,
      },
    })
  } catch (error) {
    console.error("[Messages API] Error fetching conversations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 })
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

    const { userId, message } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: userId },
          { user1Id: userId, user2Id: decoded.userId },
        ],
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: decoded.userId,
          user2Id: userId,
        },
      })
    }

    if (message) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: decoded.userId,
          receiverId: userId,
          content: message,
          status: "sent",
          read: false,
        },
      })

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() },
      })
    }

    return NextResponse.json({
      success: true,
      data: { conversationId: conversation.id },
    })
  } catch (error) {
    console.error("[Messages API] Error creating conversation:", error)
    return NextResponse.json({ success: false, error: "Failed to create conversation" }, { status: 500 })
  }
}