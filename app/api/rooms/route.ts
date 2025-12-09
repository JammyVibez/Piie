import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const privacy = searchParams.get("privacy")
    const isLive = searchParams.get("isLive")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    
    const where: Record<string, unknown> = {}
    
    if (type) {
      where.type = type
    }
    
    if (privacy) {
      where.privacy = privacy
    }
    
    if (isLive !== null && isLive !== undefined) {
      where.isLive = isLive === "true"
    }

    where.expiresAt = { gt: new Date() }
    
    const rooms = await prisma.room.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            level: true,
            xp: true,
            influenceScore: true,
            isOnline: true,
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
                level: true,
                isOnline: true,
              },
            },
          },
        },
        _count: {
          select: { members: true, messages: true },
        },
      },
    })

    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      owner: room.owner,
      type: room.type,
      title: room.title,
      description: room.description,
      privacy: room.privacy,
      inviteCode: room.inviteCode,
      maxMembers: room.maxMembers,
      members: room.members.map((m) => ({
        ...m,
        joinedAt: m.joinedAt,
      })),
      memberCount: room._count.members,
      messageCount: room._count.messages,
      isLive: room.isLive,
      theme: room.theme,
      gameId: room.gameId,
      gameName: room.gameName,
      difficulty: room.difficulty,
      lobbyCode: room.lobbyCode,
      platform: room.platform,
      anonymousMode: room.anonymousMode,
      currentPlayers: room._count.members,
      maxPlayers: room.maxMembers,
      voiceChannelActive: false,
      isStreaming: room.isLive,
      teams: {},
      expiresAt: room.expiresAt,
      createdAt: room.createdAt,
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedRooms
    })
  } catch (error) {
    console.error("[Rooms API] Error fetching rooms:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      privacy,
      maxMembers,
      gameId,
      gameName,
      difficulty,
      platform,
      lobbyCode,
      anonymousMode
    } = body
    
    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: "Title and type are required" },
        { status: 400 }
      )
    }

    const inviteCode = privacy === "invite_code" ? 
      Math.random().toString(36).substring(2, 8).toUpperCase() : 
      null

    const newRoom = await prisma.room.create({
      data: {
        ownerId: userId,
        type,
        title,
        description: description || "",
        privacy: privacy || "public",
        inviteCode,
        maxMembers: maxMembers || 10,
        isLive: false,
        theme: "default",
        gameId: type === "game" ? (gameId || null) : null,
        gameName: type === "game" ? (gameName || null) : null,
        difficulty: type === "game" ? (difficulty || "casual") : null,
        platform: type === "game" ? (platform || "cross") : null,
        lobbyCode: type === "game" ? (lobbyCode || null) : null,
        anonymousMode: anonymousMode || false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        members: {
          create: {
            userId,
            role: "owner",
            readyState: false,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            level: true,
            xp: true,
            influenceScore: true,
            isOnline: true,
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
                level: true,
                isOnline: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    })

    const formattedRoom = {
      id: newRoom.id,
      owner: newRoom.owner,
      type: newRoom.type,
      title: newRoom.title,
      description: newRoom.description,
      privacy: newRoom.privacy,
      inviteCode: newRoom.inviteCode,
      maxMembers: newRoom.maxMembers,
      members: newRoom.members.map((m) => ({
        ...m,
        joinedAt: m.joinedAt,
      })),
      memberCount: newRoom._count.members,
      isLive: newRoom.isLive,
      theme: newRoom.theme,
      gameId: newRoom.gameId,
      gameName: newRoom.gameName,
      difficulty: newRoom.difficulty,
      lobbyCode: newRoom.lobbyCode,
      platform: newRoom.platform,
      anonymousMode: newRoom.anonymousMode,
      currentPlayers: newRoom._count.members,
      maxPlayers: newRoom.maxMembers,
      voiceChannelActive: false,
      isStreaming: false,
      teams: { "Team A": [userId], "Team B": [] },
      expiresAt: newRoom.expiresAt,
      createdAt: newRoom.createdAt,
    }
    
    return NextResponse.json(
      { success: true, data: formattedRoom },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Rooms API] Error creating room:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    )
  }
}
