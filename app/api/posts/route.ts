import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const userId = searchParams.get("userId")
    const type = searchParams.get("type")
    const tag = searchParams.get("tag")
    const sort = searchParams.get("sort") || "recent"

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (userId) {
      where.authorId = userId
    }

    if (type) {
      where.postType = type
    }

    if (tag) {
      where.tags = {
        some: {
          tag: tag,
        },
      }
    }

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case "popular":
        orderBy.likes = "desc"
        break
      case "trending":
        orderBy.views = "desc"
        break
      default:
        orderBy.createdAt = "desc"
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              userRole: true,
              level: true,
              xp: true,
              influenceScore: true,
              isOnline: true,
            },
          },
          tags: true,
          poll: {
            include: {
              options: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likedBy: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      author: {
        id: post.author.id,
        name: post.author.name,
        username: post.author.username,
        avatar: post.author.avatar,
        userRole: post.author.userRole,
        level: post.author.level,
        xp: post.author.xp,
        influenceScore: post.author.influenceScore,
        isOnline: post.author.isOnline,
      },
      title: post.title,
      description: post.description,
      content: post.content,
      image: post.images?.[0] || null,
      images: post.images,
      video: post.video,
      videoThumbnail: post.videoThumbnail,
      videoDuration: post.videoDuration,
      postType: post.postType,
      visibility: post.visibility,
      rarity: post.rarity,
      likes: post.likes,
      comments: post._count.comments,
      shares: post.shares,
      views: post.views,
      tags: post.tags.map((t) => t.tag),
      poll: post.poll
        ? {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map((o) => ({
              id: o.id,
              text: o.text,
              votes: o.votes,
            })),
            totalVotes: post.poll.totalVotes,
            endsAt: post.poll.endsAt,
            isMultipleChoice: post.poll.isMultipleChoice,
          }
        : undefined,
      createdAt: post.createdAt,
      isScheduled: post.isScheduled,
      scheduledFor: post.scheduledFor,
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
    console.error("[Posts API] Error fetching posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
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
    const { title, description, content, images: mediaUrls, video, videoThumbnail, videoDuration, postType, visibility, tags, pollOptions, scheduledFor } = body

    if (!title?.trim() && !content?.trim() && !description?.trim()) {
      return NextResponse.json({ success: false, error: "Post content is required" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        authorId: decoded.userId,
        title: title || "Poll",
        description,
        content,
        images: mediaUrls || [],
        video: video || null,
        videoThumbnail: videoThumbnail || null,
        videoDuration: videoDuration || null,
        postType: postType || "post",
        visibility: visibility || "public",
        rarity: "common",
        isScheduled: !!scheduledFor,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        tags: tags
          ? {
              create: tags.map((tag: string) => ({ tag })),
            }
          : undefined,
        poll:
          postType === "poll"
            ? {
                create: {
                  question: title || "Poll",
                  endsAt: pollOptions.duration ? new Date(Date.now() + parseDuration(pollOptions.duration)) : null,
                  isMultipleChoice: pollOptions.isMultipleChoice || false,
                  options: {
                    create: pollOptions.options.map((text: string, index: number) => ({
                      text,
                      order: index,
                    })),
                  },
                },
              }
            : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            userRole: true,
            level: true,
            xp: true,
            influenceScore: true,
            isOnline: true,
          },
        },
        tags: true,
        poll: {
          include: {
            options: true,
          },
        },
      },
    })

    // Create tags if provided
    if (tags && tags.length > 0) {
      await prisma.postTag.createMany({
        data: tags.map(tag => ({
          postId: post.id,
          tag: tag.toLowerCase(),
        })),
      })
    }

    // Create notifications for mentions
    const mentionRegex = /@(\w+)/g
    const mentions = [...(description?.matchAll(mentionRegex) || [])].map(m => m[1])

    if (mentions.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: {
            in: mentions.map(m => m.toLowerCase()),
          },
        },
        select: { id: true },
      })

      if (mentionedUsers.length > 0) {
        await prisma.notification.createMany({
          data: mentionedUsers.map(user => ({
            recipientId: user.id,
            senderId: decoded.userId,
            type: 'mention',
            title: 'You were mentioned',
            message: `mentioned you in a post`,
            targetId: post.id,
            targetType: 'post',
          })),
        })
      }
    }


    const formattedPost = {
      id: post.id,
      author: post.author,
      title: post.title,
      description: post.description,
      content: post.content,
      image: post.images?.[0] || null,
      images: post.images,
      video: post.video,
      videoThumbnail: post.videoThumbnail,
      videoDuration: post.videoDuration,
      postType: post.postType,
      visibility: post.visibility,
      rarity: post.rarity,
      likes: post.likes,
      comments: 0,
      shares: post.shares,
      views: post.views,
      tags: post.tags.map((t) => t.tag),
      poll: post.poll
        ? {
            id: post.poll.id,
            question: post.poll.question,
            options: post.poll.options.map((o) => ({
              id: o.id,
              text: o.text,
              votes: o.votes,
            })),
            totalVotes: post.poll.totalVotes,
            endsAt: post.poll.endsAt,
            isMultipleChoice: post.poll.isMultipleChoice,
          }
        : undefined,
      createdAt: post.createdAt,
      isScheduled: post.isScheduled,
      scheduledFor: post.scheduledFor,
    }

    return NextResponse.json({ success: true, data: formattedPost }, { status: 201 })
  } catch (error) {
    console.error("[Posts API] Error creating post:", error)
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 })
  }
}

function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }
  const match = duration.match(/(\d+)([hd])/)
  if (match) {
    return Number.parseInt(match[1]) * units[match[2]]
  }
  return 24 * 60 * 60 * 1000
}