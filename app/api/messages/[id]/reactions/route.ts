import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await request.json()
    const { emoji } = body

    if (!emoji) {
      return NextResponse.json({ success: false, error: "Emoji required" }, { status: 400 })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    })

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: decoded.userId,
        emoji,
      },
    })

    if (existingReaction) {
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      })
      return NextResponse.json({
        success: true,
        data: { removed: true, messageId, emoji },
      })
    }

    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: decoded.userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: reaction.id,
        messageId,
        emoji: reaction.emoji,
        user: reaction.user,
        createdAt: reaction.createdAt,
      },
    })
  } catch (error) {
    console.error("[Messages API] Reaction error:", error)
    return NextResponse.json({ success: false, error: "Failed to add reaction" }, { status: 500 })
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
    const searchParams = request.nextUrl.searchParams
    const emoji = searchParams.get("emoji")

    if (!emoji) {
      return NextResponse.json({ success: false, error: "Emoji required" }, { status: 400 })
    }

    const reaction = await prisma.messageReaction.findFirst({
      where: {
        messageId,
        userId: decoded.userId,
        emoji,
      },
    })

    if (!reaction) {
      return NextResponse.json({ success: false, error: "Reaction not found" }, { status: 404 })
    }

    await prisma.messageReaction.delete({
      where: { id: reaction.id },
    })

    return NextResponse.json({ success: true, data: { removed: true } })
  } catch (error) {
    console.error("[Messages API] Reaction removal error:", error)
    return NextResponse.json({ success: false, error: "Failed to remove reaction" }, { status: 500 })
  }
}
