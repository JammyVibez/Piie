import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: roomId } = await params
    const body = await request.json()
    const { ready } = body

    // Check if user is a member
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: decoded.userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ success: false, error: "Not a member of this room" }, { status: 403 })
    }

    // Update ready state
    await prisma.roomMember.update({
      where: {
        roomId_userId: {
          roomId,
          userId: decoded.userId,
        },
      },
      data: {
        readyState: ready !== undefined ? ready : !member.readyState,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ready: ready !== undefined ? ready : !member.readyState,
      },
    })
  } catch (error) {
    console.error("[Room Ready API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update ready state" }, { status: 500 })
  }
}
