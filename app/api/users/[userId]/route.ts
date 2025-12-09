import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bannerImage: user.bannerImage,
      bio: user.bio,
      location: user.location,
      userRole: user.userRole,
      workerRole: user.workerRole,
      level: user.level,
      xp: user.xp,
      influenceScore: user.influenceScore,
      realm: user.realm,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      followers: user._count.followers,
      following: user._count.following,
      postsCount: user._count.posts,
      joinedDate: user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        icon: ub.badge.icon,
        rarity: ub.badge.rarity,
        awardedAt: ub.awardedAt,
      })),
      achievements: user.achievements.map((ua) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        rarity: ua.achievement.rarity,
        unlockedAt: ua.unlockedAt,
      })),
    }

    return NextResponse.json({ success: true, data: formattedUser })
  } catch (error) {
    console.error("[User API] Error fetching user:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    if (decoded.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields = ["name", "bio", "location", "avatar", "bannerImage", "realm"]
    const updateData: Record<string, string> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error("[User API] Error updating user:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}
