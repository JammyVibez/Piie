import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const participant = await prisma.audioParticipant.findUnique({
      where: {
        audioRoomId_userId: {
          audioRoomId: id,
          userId: payload.userId,
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ success: false, error: "Not in room" }, { status: 400 })
    }

    await prisma.audioParticipant.update({
      where: { id: participant.id },
      data: {
        leftAt: new Date(),
        isSpeaking: false,
        handRaised: false,
      },
    })

    if (participant.role === "host") {
      const remainingSpeakers = await prisma.audioParticipant.findMany({
        where: {
          audioRoomId: id,
          leftAt: null,
          role: { in: ["host", "speaker", "moderator"] },
        },
        orderBy: { joinedAt: "asc" },
      })

      if (remainingSpeakers.length > 0) {
        await prisma.audioParticipant.update({
          where: { id: remainingSpeakers[0].id },
          data: { role: "host" },
        })

        await prisma.audioRoom.update({
          where: { id },
          data: { hostId: remainingSpeakers[0].userId },
        })
      } else {
        await prisma.audioRoom.update({
          where: { id },
          data: {
            status: "ended",
            endedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Left room successfully",
    })
  } catch (error) {
    console.error("[Audio Room Leave API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to leave room" }, { status: 500 })
  }
}
