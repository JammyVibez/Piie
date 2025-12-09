
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

    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: decoded.userId
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ success: true, message: "Already a member" })
    }

    await prisma.communityMember.create({
      data: {
        communityId: id,
        userId: decoded.userId,
        role: "member"
      }
    })

    await prisma.community.update({
      where: { id },
      data: { membersCount: { increment: 1 } }
    })

    return NextResponse.json({ success: true, message: "Joined community" })
  } catch (error) {
    console.error("[Community Join API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to join community" }, { status: 500 })
  }
}
