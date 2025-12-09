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
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const type = searchParams.get("type")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      recipientId: decoded.userId,
    }

    if (unreadOnly) {
      where.read = false
    }

    if (type) {
      where.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
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
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          recipientId: decoded.userId,
          read: false,
        },
      }),
    ])

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: getNotificationTitle(notif.type),
      message: getNotificationMessage(notif.type, notif.sender?.name || "Someone"),
      sender: notif.sender,
      targetId: notif.postId,
      targetType: notif.postId ? "post" : undefined,
      read: notif.read,
      createdAt: notif.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: formattedNotifications,
        total,
        unreadCount,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("[Notifications API] Error fetching:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    const { ids, markAllRead } = await request.json()

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          recipientId: decoded.userId,
          read: false,
        },
        data: { read: true },
      })
    } else if (ids?.length) {
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          recipientId: decoded.userId,
        },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true, message: "Notifications updated" })
  } catch (error) {
    console.error("[Notifications API] Error updating:", error)
    return NextResponse.json({ success: false, error: "Failed to update notifications" }, { status: 500 })
  }
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    like: "New Like",
    comment: "New Comment",
    follow: "New Follower",
    mention: "You were mentioned",
    message: "New Message",
    system: "System Notification",
    room_invite: "Room Invitation",
    fusion_layer: "New Fusion Layer",
  }
  return titles[type] || "Notification"
}

function getNotificationMessage(type: string, senderName: string): string {
  const messages: Record<string, string> = {
    like: `${senderName} liked your post`,
    comment: `${senderName} commented on your post`,
    follow: `${senderName} started following you`,
    mention: `${senderName} mentioned you`,
    message: `${senderName} sent you a message`,
    system: "You have a new system notification",
    room_invite: `${senderName} invited you to a room`,
    fusion_layer: `${senderName} added a layer to your fusion`,
  }
  return messages[type] || "You have a new notification"
}
