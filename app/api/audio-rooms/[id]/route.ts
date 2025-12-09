import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const room = await prisma.audioRoom.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: room,
    })
  } catch (error) {
    console.error("[Audio Room API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch room" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const room = await prisma.audioRoom.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    if (room.hostId !== payload.userId) {
      return NextResponse.json({ success: false, error: "Only the host can update the room" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (body.status) {
      updateData.status = body.status
      if (body.status === "live" && !room.startedAt) {
        updateData.startedAt = new Date()
      }
      if (body.status === "ended" && !room.endedAt) {
        updateData.endedAt = new Date()
      }
    }
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.isRecording !== undefined) updateData.isRecording = body.isRecording

    const updated = await prisma.audioRoom.update({
      where: { id },
      data: updateData,
      include: {
        host: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
        participants: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error("[Audio Room API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 })
  }
}
