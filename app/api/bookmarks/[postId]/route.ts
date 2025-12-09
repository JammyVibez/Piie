import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
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

    const { postId } = await params
    const body = await request.json().catch(() => ({}))
    const collectionId = body.collectionId || null

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json({ success: false, error: "Already bookmarked" }, { status: 400 })
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: decoded.userId,
        postId,
        collectionId,
      },
      include: {
        post: {
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
        },
      },
    })

    return NextResponse.json({ 
      success: true, 
      data: bookmark,
      isBookmarked: true,
    }, { status: 201 })
  } catch (error) {
    console.error("[Bookmark API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to add bookmark" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
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

    const { postId } = await params

    await prisma.bookmark.deleteMany({
      where: {
        userId: decoded.userId,
        postId,
      },
    })

    return NextResponse.json({ success: true, message: "Bookmark removed", isBookmarked: false })
  } catch (error) {
    console.error("[Bookmark Delete API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to remove bookmark" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
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

    const { postId } = await params
    const { collectionId } = await request.json()

    const bookmark = await prisma.bookmark.update({
      where: { 
        userId_postId: { 
          userId: decoded.userId, 
          postId 
        } 
      },
      data: { collectionId },
    })

    return NextResponse.json({ success: true, data: bookmark })
  } catch (error) {
    console.error("[Bookmark Update API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update bookmark" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params

    let isBookmarked = false
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        const existingBookmark = await prisma.bookmark.findUnique({
          where: {
            userId_postId: {
              userId: decoded.userId,
              postId,
            },
          },
        })
        isBookmarked = !!existingBookmark
      }
    }

    return NextResponse.json({
      success: true,
      data: { isBookmarked },
    })
  } catch (error) {
    console.error("[Bookmark Status API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to get bookmark status" }, { status: 500 })
  }
}
