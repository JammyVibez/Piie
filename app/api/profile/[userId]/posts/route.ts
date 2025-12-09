import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
        visibility: "public",
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            level: true,
            userRole: true,
          },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
    })

    const total = await prisma.post.count({
      where: {
        authorId: userId,
        visibility: "public",
      },
    })

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      content: post.content,
      images: post.images,
      video: post.video,
      videoThumbnail: post.videoThumbnail,
      postType: post.postType,
      visibility: post.visibility,
      likes: post.likes,
      views: post.views,
      commentsCount: post._count.comments,
      isLiked: false,
      isSaved: false,
      author: post.author,
      tags: post.tags.map((t) => t.tag),
      createdAt: post.createdAt,
      timestamp: post.createdAt,
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
    console.error("[Profile Posts API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch user posts" }, { status: 500 })
  }
}
