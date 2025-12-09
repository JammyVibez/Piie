import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    let currentUserId: string | null = null

    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        currentUserId = decoded.userId
      }
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "5")

    const where: Record<string, unknown> = {}
    if (currentUserId) {
      where.id = { not: currentUserId }
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { influenceScore: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        userRole: true,
        level: true,
        influenceScore: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: user.userRole,
      level: user.level,
      followers: formatFollowers(user._count.followers),
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    })
  } catch (error) {
    console.error("[Suggested Users API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch suggested users" }, { status: 500 })
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
