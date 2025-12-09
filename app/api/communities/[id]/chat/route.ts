import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    const where: Record<string, unknown> = { communityId: id }
    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.communityMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
    })

    const senderIds = [...new Set(messages.map(m => m.senderId))]
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
      },
    })
    const senderMap = new Map(senders.map(s => [s.id, s]))

    const formattedMessages = messages.map(message => ({
      ...message,
      sender: senderMap.get(message.senderId),
    })).reverse()

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    })
  } catch (error) {
    console.error("[Community Chat API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const { content, attachments, replyToId } = await request.json()

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: payload.userId,
        },
      },
    })

    if (!membership || membership.isBanned) {
      return NextResponse.json({ success: false, error: "Not a member of this community" }, { status: 403 })
    }

    const message = await prisma.communityMessage.create({
      data: {
        communityId: id,
        senderId: payload.userId,
        content: content || "",
        attachments: attachments || [],
        replyToId,
      },
      include: {
        reactions: true,
        replyTo: {
          select: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
    })

    const sender = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...message,
        sender,
      },
    })
  } catch (error) {
    console.error("[Community Chat API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
