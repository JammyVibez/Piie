import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
) {
  try {
    const { fusionId } = await params

    const layers = await prisma.fusionLayer.findMany({
      where: { fusionPostId: fusionId },
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
    })

    return NextResponse.json({
      success: true,
      data: layers,
    })
  } catch (error) {
    console.error("[Fusion Layers API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch layers" }, { status: 500 })
  }
}

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
    const { type, content, mediaUrl, positionX, positionY, parentLayerId } = body

    if (!type || !content) {
      return NextResponse.json({ success: false, error: "Type and content required" }, { status: 400 })
    }

    // Check if fusion post exists
    const fusionPost = await prisma.fusionPost.findUnique({
      where: { id: fusionId },
      select: { id: true, totalLayers: true }
    })

    if (!fusionPost) {
      return NextResponse.json({ success: false, error: "Fusion post not found" }, { status: 404 })
    }

    // Create layer
    const layer = await prisma.fusionLayer.create({
      data: {
        fusionPostId: fusionId,
        authorId: decoded.userId,
        type,
        content,
        mediaUrl: mediaUrl || null,
        positionX: positionX || 0,
        positionY: positionY || 0,
        parentLayerId: parentLayerId || null,
        layerOrder: fusionPost.totalLayers + 1,
        likes: 0,
        isApproved: true,
      },
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
    })

    // Update fusion post layer count
    await prisma.fusionPost.update({
      where: { id: fusionId },
      data: {
        totalLayers: { increment: 1 },
        contributorCount: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, data: layer }, { status: 201 })
  } catch (error) {
    console.error("[Fusion Layers API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to add layer" }, { status: 500 })
  }
}
