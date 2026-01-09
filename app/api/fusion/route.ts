import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if Prisma is available
    if (!prisma) {
      console.error("[Fusion API] Prisma client not initialized")
      return NextResponse.json(
        { success: false, error: "Database connection not available" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (userId) {
      where.ownerId = userId
    }

    const [fusionPosts, total] = await Promise.all([
      prisma.fusionPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              userRole: true,
              level: true,
            },
          },
          layers: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
            },
            orderBy: { layerOrder: "asc" },
            take: 5,
          },
          _count: {
            select: {
              layers: true,
            },
          },
        },
      }),
      prisma.fusionPost.count({ where }),
    ])

    // Get like counts for all fusion posts
    const fusionIds = fusionPosts.map(fp => fp.id)
    const seedLayers = await prisma.fusionLayer.findMany({
      where: {
        fusionPostId: { in: fusionIds },
        layerOrder: 0,
      },
      select: { id: true, fusionPostId: true },
    })

    const seedLayerIds = seedLayers.map(sl => sl.id)
    const reactions = await prisma.fusionReaction.findMany({
      where: {
        layerId: { in: seedLayerIds },
        type: 'like',
      },
      select: { layerId: true },
    })

    const likeCountMap = new Map<string, number>()
    seedLayers.forEach(sl => {
      const count = reactions.filter(r => r.layerId === sl.id).length
      likeCountMap.set(sl.fusionPostId, count)
    })

    const formattedPosts = fusionPosts.map((fp) => ({
      id: fp.id,
      ownerId: fp.ownerId,
      owner: {
        id: fp.owner.id,
        name: fp.owner.name,
        username: fp.owner.username,
        avatar: fp.owner.avatar,
      },
      title: fp.title,
      seedContent: fp.seedContent,
      seedMediaUrl: fp.seedMediaUrl,
      seedType: fp.seedType,
      layers: fp.layers.map((layer) => ({
        id: layer.id,
        type: layer.type,
        content: layer.content,
        mediaUrl: layer.mediaUrl,
        author: layer.author,
        authorId: layer.authorId,
        fusionPostId: layer.fusionPostId,
        layerOrder: layer.layerOrder,
        positionX: layer.positionX,
        positionY: layer.positionY,
        likes: layer.likes,
        isApproved: layer.isApproved,
        createdAt: layer.createdAt,
      })),
      privacy: fp.privacy,
      currentState: fp.currentState,
      viewMode: fp.viewMode,
      contributorCount: fp.contributorCount,
      totalLayers: fp._count.layers,
      forkCount: fp.forkCount,
      createdAt: fp.createdAt,
      updatedAt: fp.updatedAt,
      likes: likeCountMap.get(fp.id) || 0,
      comments: [],
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: formattedPosts,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("[Fusion API] Error fetching fusion posts:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch fusion posts",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      seedContent,
      seedMediaUrl,
      seedType,
      privacy,
      allowedContributors,
      allowedLayerTypes,
      moderationMode,
    } = body

    if (!title || !seedContent) {
      return NextResponse.json({ success: false, error: "Title and seed content required" }, { status: 400 })
    }

    const fusionPost = await prisma.fusionPost.create({
      data: {
        ownerId: decoded.userId,
        title,
        seedContent,
        seedMediaUrl: seedMediaUrl || null,
        seedType: seedType || "text",
        privacy: privacy || "public",
        allowedContributors: allowedContributors || "public",
        allowedLayerTypes: allowedLayerTypes || ["text", "image", "video", "voice", "draw", "sticker", "overlay"],
        moderationMode: moderationMode || "none",
        contributorCount: 1,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        layers: true,
      },
    })

    const formattedPost = {
      id: fusionPost.id,
      author: {
        id: fusionPost.owner.id,
        name: fusionPost.owner.name,
        username: fusionPost.owner.username,
        avatar: fusionPost.owner.avatar,
      },
      title: fusionPost.title,
      content: {
        text: fusionPost.seedContent,
        layers: [],
      },
      seedMediaUrl: fusionPost.seedMediaUrl,
      seedType: fusionPost.seedType,
      privacy: fusionPost.privacy,
      currentState: fusionPost.currentState,
      viewMode: fusionPost.viewMode,
      contributorCount: fusionPost.contributorCount,
      totalLayers: 0,
      forkCount: fusionPost.forkCount,
      createdAt: fusionPost.createdAt,
      updatedAt: fusionPost.updatedAt,
      likes: 0,
      comments: [],
    }

    return NextResponse.json({ success: true, data: formattedPost }, { status: 201 })
  } catch (error) {
    console.error("[Fusion API] Error creating fusion post:", error)
    return NextResponse.json({ success: false, error: "Failed to create fusion post" }, { status: 500 })
  }
}
