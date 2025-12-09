
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params

    await prisma.communityMember.deleteMany({
      where: {
        communityId: id,
        userId: decoded.userId
      }
    })

    await prisma.community.update({
      where: { id },
      data: { membersCount: { decrement: 1 } }
    })

    return NextResponse.json({ success: true, message: "Left community" })
  } catch (error) {
    console.error("[Community Leave API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to leave community" }, { status: 500 })
  }
}
