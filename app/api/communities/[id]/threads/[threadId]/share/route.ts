import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; threadId: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { threadId } = await params

    await prisma.threadShare.create({
      data: {
        threadId,
        userId: payload.userId,
      },
    })

    const shareCount = await prisma.threadShare.count({
      where: { threadId },
    })

    return NextResponse.json({
      success: true,
      shareCount,
    })
  } catch (error) {
    console.error("[Thread Share API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to share thread" }, { status: 500 })
  }
}
