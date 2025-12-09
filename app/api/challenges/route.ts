import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"
    const type = searchParams.get("type")

    let currentUserId: string | null = null
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        currentUserId = decoded.userId
      }
    }

    const where: Record<string, unknown> = {}
    if (status !== "all") where.status = status
    if (type) where.type = type

    const challenges = await prisma.challenge.findMany({
      where,
      orderBy: [
        { type: "asc" },
        { xpReward: "desc" },
      ],
      include: {
        badgeReward: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    })

    let userProgress: Record<string, { currentValue: number; isCompleted: boolean; completedAt: Date | null }> = {}

    if (currentUserId) {
      const progress = await prisma.challengeProgress.findMany({
        where: { userId: currentUserId },
      })
      userProgress = progress.reduce((acc, p) => {
        acc[p.challengeId] = {
          currentValue: p.currentValue,
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
        }
        return acc
      }, {} as typeof userProgress)
    }

    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge,
      progress: userProgress[challenge.id]?.currentValue || 0,
      maxProgress: challenge.targetValue,
      completed: userProgress[challenge.id]?.isCompleted || false,
      progressPercentage: Math.min(
        100,
        Math.floor(((userProgress[challenge.id]?.currentValue || 0) / challenge.targetValue) * 100)
      ),
    }))

    return NextResponse.json({
      success: true,
      data: challengesWithProgress,
    })
  } catch (error) {
    console.error("[Challenges API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true },
    })

    if (user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const {
      title,
      description,
      type = "daily",
      requirement,
      targetValue,
      xpReward,
      badgeRewardId,
      startsAt,
      endsAt,
    } = await request.json()

    if (!title || !requirement || !targetValue || !xpReward) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        type,
        requirement,
        targetValue,
        xpReward,
        badgeRewardId,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        status: "active",
      },
      include: {
        badgeReward: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: challenge,
    })
  } catch (error) {
    console.error("[Challenges API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create challenge" }, { status: 500 })
  }
}
