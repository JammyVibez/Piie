import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    })
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...room,
        membersCount: room._count.members,
        messagesCount: room._count.messages,
      }
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch room" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    
    const room = await prisma.room.findUnique({ where: { id } })
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      )
    }

    if (room.ownerId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this room" },
        { status: 403 }
      )
    }

    const allowedFields = ['title', 'description', 'privacy', 'maxMembers', 'isLive', 'theme']
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    const updatedRoom = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: updatedRoom
    })
  } catch (error) {
    console.error("Error updating room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update room" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { id } = await context.params
    
    const room = await prisma.room.findUnique({ where: { id } })
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      )
    }

    if (room.ownerId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this room" },
        { status: 403 }
      )
    }
    
    await prisma.room.delete({ where: { id } })
    
    return NextResponse.json({
      success: true,
      message: "Room deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete room" },
      { status: 500 }
    )
  }
}
