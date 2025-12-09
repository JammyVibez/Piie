import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const collectionId = searchParams.get("collectionId")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      userId: decoded.userId,
    }

    if (collectionId && collectionId !== "all") {
      where.collectionId = collectionId
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                  userRole: true,
                },
              },
              tags: true,
            },
          },
          collection: true,
        },
      }),
      prisma.bookmark.count({ where }),
    ])

    let formattedBookmarks = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      postId: bookmark.postId,
      collectionId: bookmark.collectionId,
      collectionName: bookmark.collection?.name,
      bookmarkedAt: bookmark.createdAt,
      isBookmarked: true,
      post: {
        id: bookmark.post.id,
        author: bookmark.post.author,
        title: bookmark.post.title,
        description: bookmark.post.description,
        images: bookmark.post.images,
        video: bookmark.post.video,
        postType: bookmark.post.postType,
        likes: bookmark.post.likes,
        comments: bookmark.post.commentsCount,
        shares: bookmark.post.shares,
        views: bookmark.post.views,
        tags: bookmark.post.tags.map((t) => t.tag),
        rarity: bookmark.post.rarity,
        createdAt: bookmark.post.createdAt,
      },
    }))

    if (search) {
      const searchLower = search.toLowerCase()
      formattedBookmarks = formattedBookmarks.filter(
        (b) =>
          b.post.title.toLowerCase().includes(searchLower) ||
          b.post.description.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        items: formattedBookmarks,
        total: search ? formattedBookmarks.length : total,
        page,
        limit,
        hasMore: skip + limit < (search ? formattedBookmarks.length : total),
      },
    })
  } catch (error) {
    console.error("[Bookmarks API] Error fetching:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookmarks" }, { status: 500 })
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

    const { postId, collectionId } = await request.json()

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 })
    }

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
        collectionId: collectionId || null,
      },
    })

    return NextResponse.json({ success: true, data: bookmark }, { status: 201 })
  } catch (error) {
    console.error("[Bookmarks API] Error creating:", error)
    return NextResponse.json({ success: false, error: "Failed to add bookmark" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 })
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: decoded.userId,
        postId,
      },
    })

    return NextResponse.json({ success: true, message: "Bookmark removed" })
  } catch (error) {
    console.error("[Bookmarks API] Error deleting:", error)
    return NextResponse.json({ success: false, error: "Failed to remove bookmark" }, { status: 500 })
  }
}
