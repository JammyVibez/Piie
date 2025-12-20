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
    const body = await request.json()
    const { title, seedContent } = body

    // Get original fusion post
    const originalFusion = await prisma.fusionPost.findUnique({
      where: { id: fusionId },
      include: {
        layers: {
          orderBy: { layerOrder: "asc" }
        }
      }
    })

    if (!originalFusion) {
      return NextResponse.json({ success: false, error: "Fusion not found" }, { status: 404 })
    }

    // Create fork
    const forkedFusion = await prisma.fusionPost.create({
      data: {
        ownerId: decoded.userId,
        title: title || `${originalFusion.title} (Fork)`,
        seedContent: seedContent || originalFusion.seedContent,
        seedMediaUrl: originalFusion.seedMediaUrl,
        seedType: originalFusion.seedType,
        privacy: originalFusion.privacy,
        allowedContributors: originalFusion.allowedContributors,
        allowedLayerTypes: originalFusion.allowedLayerTypes,
        moderationMode: originalFusion.moderationMode,
        forkedFromId: fusionId,
        contributorCount: 1,
        totalLayers: originalFusion.layers.length,
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

    // Copy layers to fork
    if (originalFusion.layers.length > 0) {
      await prisma.fusionLayer.createMany({
        data: originalFusion.layers.map((layer, index) => ({
          fusionPostId: forkedFusion.id,
          authorId: layer.authorId,
          type: layer.type,
          content: layer.content,
          mediaUrl: layer.mediaUrl,
          layerOrder: index + 1,
          positionX: layer.positionX,
          positionY: layer.positionY,
          likes: 0,
          isApproved: true,
        }))
      })
    }

    // Increment fork count
    await prisma.fusionPost.update({
      where: { id: fusionId },
      data: { forkCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: forkedFusion.id,
        message: "Fusion forked successfully"
      }
    })
  } catch (error) {
    console.error("[Fusion Fork API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fork fusion" }, { status: 500 })
  }
}

