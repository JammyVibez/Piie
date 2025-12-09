import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, getFollowCounts } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    let currentUserId: string | null = null
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        currentUserId = decoded.userId
      }
    }

    // Try to find by ID first
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bannerImage: true,
        bio: true,
        location: true,
        userRole: true,
        workerRole: true,
        level: true,
        xp: true,
        influenceScore: true,
        realm: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    // If not found by ID, try username
    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: userId.toLowerCase() },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          bannerImage: true,
          bio: true,
          location: true,
          userRole: true,
          workerRole: true,
          level: true,
          xp: true,
          influenceScore: true,
          realm: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const { followers, following } = await getFollowCounts(userId)

    let isFollowing = false
    if (currentUserId && currentUserId !== userId) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: currentUserId,
          followingId: userId,
        },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        followers,
        following,
        postsCount: user._count.posts,
        isFollowing,
        isOwnProfile: currentUserId === userId,
        joinedDate: user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      },
    })
  } catch (error) {
    console.error("[Profile API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || decoded.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const updates = await request.json()

    const allowedFields = ["name", "bio", "location", "avatar", "bannerImage", "userRole", "workerRole", "realm"]
    const filteredUpdates: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: filteredUpdates,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bannerImage: true,
        bio: true,
        location: true,
        userRole: true,
        workerRole: true,
        level: true,
        xp: true,
        influenceScore: true,
        realm: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("[Profile API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
