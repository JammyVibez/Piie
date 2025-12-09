import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const participants = await prisma.audioParticipant.findMany({
      where: {
        audioRoomId: id,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { joinedAt: "asc" },
      ],
    })

    return NextResponse.json({
      success: true,
      data: participants,
    })
  } catch (error) {
    console.error("[Audio Participants API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch participants" }, { status: 500 })
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
    const { targetUserId, action, value } = await request.json()

    const room = await prisma.audioRoom.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    const requesterParticipant = await prisma.audioParticipant.findUnique({
      where: {
        audioRoomId_userId: {
          audioRoomId: id,
          userId: payload.userId,
        },
      },
    })

    const isHost = room.hostId === payload.userId
    const isModerator = requesterParticipant?.role === "moderator"
    const isSelf = targetUserId === payload.userId

    const targetParticipant = await prisma.audioParticipant.findUnique({
      where: {
        audioRoomId_userId: {
          audioRoomId: id,
          userId: targetUserId,
        },
      },
    })

    if (!targetParticipant) {
      return NextResponse.json({ success: false, error: "Participant not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    switch (action) {
      case "mute":
        if (!isSelf && !isHost && !isModerator) {
          return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
        }
        updateData.isMuted = value ?? true
        updateData.isSpeaking = false
        break

      case "unmute":
        if (!isSelf) {
          return NextResponse.json({ success: false, error: "Only user can unmute themselves" }, { status: 403 })
        }
        updateData.isMuted = false
        break

      case "raise_hand":
        if (!isSelf) {
          return NextResponse.json({ success: false, error: "Only user can raise their hand" }, { status: 403 })
        }
        updateData.handRaised = value ?? true
        break

      case "promote_to_speaker":
        if (!isHost && !isModerator) {
          return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
        }
        updateData.role = "speaker"
        updateData.handRaised = false
        break

      case "demote_to_listener":
        if (!isHost && !isModerator) {
          return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })
        }
        updateData.role = "listener"
        updateData.isMuted = true
        updateData.isSpeaking = false
        break

      case "make_moderator":
        if (!isHost) {
          return NextResponse.json({ success: false, error: "Only host can assign moderators" }, { status: 403 })
        }
        updateData.role = "moderator"
        break

      case "speaking":
        if (isSelf) {
          updateData.isSpeaking = value ?? true
        }
        break

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 })
    }

    const updated = await prisma.audioParticipant.update({
      where: { id: targetParticipant.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error("[Audio Participants API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update participant" }, { status: 500 })
  }
}
