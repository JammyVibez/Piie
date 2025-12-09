import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get("communityId")
    const status = searchParams.get("status") || "live"

    const where: Record<string, unknown> = {}
    if (communityId) where.communityId = communityId
    if (status !== "all") where.status = status

    const rooms = await prisma.audioRoom.findMany({
      where,
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
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: rooms,
    })
  } catch (error) {
    console.error("[Audio Rooms API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { title, description, topic, communityId, maxSpeakers = 10, scheduledFor } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const room = await prisma.audioRoom.create({
      data: {
        hostId: payload.userId,
        title,
        description,
        topic,
        communityId,
        maxSpeakers,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: "waiting",
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    await prisma.audioParticipant.create({
      data: {
        audioRoomId: room.id,
        userId: payload.userId,
        role: "host",
        isMuted: false,
      },
    })

    await xpService.awardXP(payload.userId, "room_created", room.id, "audio_room")

    return NextResponse.json({
      success: true,
      data: room,
    })
  } catch (error) {
    console.error("[Audio Rooms API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create room" }, { status: 500 })
  }
}
