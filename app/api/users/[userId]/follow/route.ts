import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { updateInfluenceScore, updateChallengeProgress, checkAndAwardAutomaticBadges } from "@/lib/gamification"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    const { userId } = await params

    if (decoded.userId === userId) {
      return NextResponse.json({ success: false, error: "Cannot follow yourself" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId: userId,
        },
      },
    })

    if (existingFollow) {
      return NextResponse.json({ success: false, error: "Already following this user" }, { status: 400 })
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

    await updateInfluenceScore(userId)
    await updateChallengeProgress(decoded.userId, "follow_users", 1)
    await checkAndAwardAutomaticBadges(userId)

    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    })

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: true,
        followerCount,
      },
    })
  } catch (error) {
    console.error("[Follow API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    const { userId } = await params

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: decoded.userId,
        followingId: userId,
      },
    })

    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    })

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: false,
        followerCount,
      },
    })
  } catch (error) {
    console.error("[Unfollow API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to unfollow user" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    let isFollowing = false
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        const existingFollow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: decoded.userId,
              followingId: userId,
            },
          },
        })
        isFollowing = !!existingFollow
      }
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: userId },
    })

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        followerCount,
      },
    })
  } catch (error) {
    console.error("[Follow Status API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to get follow status" }, { status: 500 })
  }
}
