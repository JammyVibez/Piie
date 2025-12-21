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

    // Check if user is the owner
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    })

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    if (room.ownerId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Only room owner can start the game" }, { status: 403 })
    }

    // Check if all members are ready
    const allReady = room.members.every(m => m.readyState || m.userId === room.ownerId)
    if (!allReady) {
      return NextResponse.json({ success: false, error: "Not all members are ready" }, { status: 400 })
    }

    // Update room to live
    await prisma.room.update({
      where: { id: roomId },
      data: {
        isLive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Game started",
    })
  } catch (error) {
    console.error("[Room Start API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to start game" }, { status: 500 })
  }
}

