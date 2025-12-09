import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { role = "listener" } = await request.json().catch(() => ({}))

    const room = await prisma.audioRoom.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: true } },
      },
    })

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    if (room.status === "ended") {
      return NextResponse.json({ success: false, error: "Room has ended" }, { status: 400 })
    }

    const existingParticipant = await prisma.audioParticipant.findUnique({
      where: {
        audioRoomId_userId: {
          audioRoomId: id,
          userId: payload.userId,
        },
      },
    })

    if (existingParticipant && !existingParticipant.leftAt) {
      return NextResponse.json({ success: false, error: "Already in room" }, { status: 400 })
    }

    const participant = existingParticipant
      ? await prisma.audioParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            leftAt: null,
            role,
            isMuted: true,
            isSpeaking: false,
            handRaised: false,
          },
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
        })
      : await prisma.audioParticipant.create({
          data: {
            audioRoomId: id,
            userId: payload.userId,
            role,
            isMuted: true,
          },
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
        })

    await xpService.awardXP(payload.userId, "room_participated", id, "audio_room")

    return NextResponse.json({
      success: true,
      data: participant,
    })
  } catch (error) {
    console.error("[Audio Room Join API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to join room" }, { status: 500 })
  }
}
