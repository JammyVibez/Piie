import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params

    // For now, return empty array
    // You may want to create a DiscussionTopic model
    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {
    console.error("[Room Topics API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch topics" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id: roomId } = await params
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content required" }, { status: 400 })
    }

    // Verify user is a member
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

    // For now, create a post as a topic
    // You may want to create a DiscussionTopic model
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: `topic-${Date.now()}`,
        title,
        content,
        author: user,
        createdAt: new Date(),
        replies: [],
      },
    })
  } catch (error) {
    console.error("[Room Topics API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create topic" }, { status: 500 })
  }
}

