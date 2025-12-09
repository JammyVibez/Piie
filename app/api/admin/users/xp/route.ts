import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, findUserById } from "@/lib/auth"

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

    const adminUser = await findUserById(decoded.userId)
    if (!adminUser || adminUser.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, xpAmount, reason } = body

    if (!userId || typeof xpAmount !== "number") {
      return NextResponse.json({ success: false, error: "User ID and XP amount are required" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const newXp = targetUser.xp + xpAmount
    const newLevel = Math.floor(newXp / 1000) + 1

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
      select: {
        id: true,
        username: true,
        name: true,
        xp: true,
        level: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        xpAdded: xpAmount,
        reason: reason || "Admin XP grant",
      },
    })
  } catch (error) {
    console.error("[Admin XP API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to grant XP" }, { status: 500 })
  }
}
