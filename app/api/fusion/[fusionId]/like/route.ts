
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { fusionId } = await params

    const fusionPost = await prisma.fusionPost.findUnique({
      where: { id: fusionId },
    })

    if (!fusionPost) {
      return NextResponse.json({ success: false, error: "Fusion not found" }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.fusionReaction.findFirst({
      where: {
        userId: decoded.userId,
        layer: {
          fusionPostId: fusionId,
          layerOrder: 0, // Seed layer
        },
        type: "like",
      },
    })

    if (existingLike) {
      return NextResponse.json({ success: false, error: "Already liked" }, { status: 400 })
    }

    // Find seed layer
    const seedLayer = await prisma.fusionLayer.findFirst({
      where: {
        fusionPostId: fusionId,
        layerOrder: 0,
      },
    })

    if (!seedLayer) {
      return NextResponse.json({ success: false, error: "Seed layer not found" }, { status: 404 })
    }

    // Create like
    await prisma.fusionReaction.create({
      data: {
        layerId: seedLayer.id,
        userId: decoded.userId,
        type: "like",
      },
    })

    // Update likes count
    await prisma.fusionLayer.update({
      where: { id: seedLayer.id },
      data: { likes: { increment: 1 } },
    })

    const totalLikes = await prisma.fusionReaction.count({
      where: {
        layer: {
          fusionPostId: fusionId,
        },
        type: "like",
      },
    })

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: totalLikes,
    })
  } catch (error) {
    console.error("[Fusion Like API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to like fusion" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { fusionId } = await params

    const existingLike = await prisma.fusionReaction.findFirst({
      where: {
        userId: decoded.userId,
        layer: {
          fusionPostId: fusionId,
        },
        type: "like",
      },
      include: {
        layer: true,
      },
    })

    if (existingLike) {
      await prisma.fusionReaction.delete({
        where: { id: existingLike.id },
      })

      await prisma.fusionLayer.update({
        where: { id: existingLike.layerId },
        data: { likes: { decrement: 1 } },
      })
    }

    const totalLikes = await prisma.fusionReaction.count({
      where: {
        layer: {
          fusionPostId: fusionId,
        },
        type: "like",
      },
    })

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: totalLikes,
    })
  } catch (error) {
    console.error("[Fusion Unlike API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to unlike fusion" }, { status: 500 })
  }
}
