import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            userRole: true,
            level: true,
          },
        },
        poll: {
          include: {
            options: true,
            votes: userId ? {
              where: { userId },
              take: 1,
            } : false,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    })

    let isLiked = false
    let isBookmarked = false
    if (userId) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findFirst({ where: { postId, userId } }),
        prisma.bookmark.findFirst({ where: { postId, userId } }),
      ])
      isLiked = !!like
      isBookmarked = !!bookmark
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      description: post.description,
      content: post.content,
      images: post.images,
      video: post.video,
      videoThumbnail: post.videoThumbnail,
      videoDuration: post.videoDuration,
      postType: post.postType,
      visibility: post.visibility,
      tags: post.tags,
      author: post.author,
      likesCount: post.likesCount,
      commentsCount: post._count.comments,
      sharesCount: post.sharesCount,
      repostsCount: post.repostsCount,
      views: post.views + 1,
      isLiked,
      isBookmarked,
      poll: post.poll ? {
        id: post.poll.id,
        question: post.poll.question,
        options: post.poll.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes,
          percentage: post.poll!.totalVotes > 0 
            ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
            : 0,
        })),
        totalVotes: post.poll.totalVotes,
        endsAt: post.poll.endsAt,
        hasVoted: post.poll.votes && post.poll.votes.length > 0,
        votedOptionId: post.poll.votes?.[0]?.optionId || null,
      } : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }

    return NextResponse.json({ success: true, data: formattedPost })
  } catch (error) {
    console.error("[Post API] Error fetching:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch post" }, { status: 500 })
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
    const body = await request.json()

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to edit this post" }, { status: 403 })
    }

    const allowedFields = ['title', 'description', 'content', 'images', 'visibility', 'tags']
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updatedPost })
  } catch (error) {
    console.error("[Post API] Error updating:", error)
    return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
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

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    if (post.authorId !== decoded.userId) {
      return NextResponse.json({ success: false, error: "Not authorized to delete this post" }, { status: 403 })
    }

    await prisma.post.delete({ where: { id: postId } })

    return NextResponse.json({ success: true, message: "Post deleted successfully" })
  } catch (error) {
    console.error("[Post API] Error deleting:", error)
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 })
  }
}
