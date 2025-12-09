import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, findUserById } from "@/lib/auth"

export async function GET() {
  try {
    const challenges = await prisma.achievement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    const formattedChallenges = challenges.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      icon: c.icon,
      rarity: c.rarity,
      participants: c._count.users,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedChallenges,
    })
  } catch (error) {
    console.error("[Admin Challenges API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch challenges" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const user = await findUserById(decoded.userId)
    if (!user || user.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, rarity, xpReward } = body

    if (!name || !description) {
      return NextResponse.json({ success: false, error: "Name and description are required" }, { status: 400 })
    }

    const challenge = await prisma.achievement.create({
      data: {
        name,
        description,
        icon: icon || "🏆",
        rarity: rarity || "common",
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        icon: challenge.icon,
        rarity: challenge.rarity,
        xpReward: xpReward || 100,
        createdAt: challenge.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[Admin Challenges API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create challenge" }, { status: 500 })
  }
}
