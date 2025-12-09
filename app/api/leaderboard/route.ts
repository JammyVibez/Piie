import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "influence"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    let currentUserId: string | null = null
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        currentUserId = decoded.userId
      }
    }

    let orderBy: Record<string, string>[]
    switch (type) {
      case "xp":
        orderBy = [{ xp: "desc" }]
        break
      case "level":
        orderBy = [{ level: "desc" }, { xp: "desc" }]
        break
      case "followers":
        orderBy = [{ influenceScore: "desc" }]
        break
      default:
        orderBy = [{ influenceScore: "desc" }, { level: "desc" }]
    }

    const users = await prisma.user.findMany({
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        userRole: true,
        level: true,
        xp: true,
        influenceScore: true,
        realm: true,
        _count: {
          select: { followers: true, posts: true },
        },
      },
    })

    const total = await prisma.user.count()

    let currentUserRank = null
    if (currentUserId) {
      const allUsers = await prisma.user.findMany({
        orderBy,
        select: { id: true },
      })
      const rankIndex = allUsers.findIndex((u) => u.id === currentUserId)
      if (rankIndex !== -1) {
        currentUserRank = rankIndex + 1
      }
    }

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: user.userRole,
      level: user.level,
      xp: user.xp,
      influenceScore: user.influenceScore,
      realm: user.realm,
      followers: user._count.followers,
      posts: user._count.posts,
      isCurrentUser: user.id === currentUserId,
    }))

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        currentUserRank,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("[Leaderboard API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
