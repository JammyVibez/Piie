
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
) {
  try {
    const { fusionId } = await params

    // In production: await prisma.fusionLayer.findMany({ where: { fusionPostId: fusionId }, include: { author: true } })

    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch layers" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
) {
  try {
    const { fusionId } = await params
    const body = await request.json()
    const { type, content, mediaUrl, positionX, positionY, parentLayerId } = body

    if (!type || !content) {
      return NextResponse.json({ success: false, error: "Type and content required" }, { status: 400 })
    }

    // In production:
    // const layer = await prisma.fusionLayer.create({
    //   data: {
    //     fusionPostId: fusionId,
    //     authorId: "current-user-id",
    //     type,
    //     content,
    //     mediaUrl,
    //     positionX,
    //     positionY,
    //     parentLayerId,
    //   },
    //   include: { author: true },
    // })

    const mockLayer = {
      id: `layer-${Date.now()}`,
      fusionPostId: fusionId,
      authorId: "current-user",
      type,
      content,
      mediaUrl,
      positionX,
      positionY,
      parentLayerId,
      layerOrder: 0,
      likes: 0,
      isApproved: true,
      createdAt: new Date(),
    }

    return NextResponse.json({ success: true, data: mockLayer }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add layer" }, { status: 500 })
  }
}
