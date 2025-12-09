import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    if (userId === decoded.userId) {
      return NextResponse.json({ success: false, error: "Cannot follow yourself" }, { status: 400 })
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: decoded.userId,
        followingId: userId,
      },
    })

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      return NextResponse.json({
        success: true,
        data: { action: "unfollowed" },
      })
    }

    await prisma.follow.create({
      data: {
        followerId: decoded.userId,
        followingId: userId,
      },
    })

    await prisma.notification.create({
      data: {
        recipientId: userId,
        senderId: decoded.userId,
        type: "follow",
        title: "New Follower",
        message: "Someone started following you",
      },
    })

    return NextResponse.json({
      success: true,
      data: { action: "followed" },
    })
  } catch (error) {
    console.error("[Follow API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to follow/unfollow user" }, { status: 500 })
  }
}
