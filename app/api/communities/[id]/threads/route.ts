import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where: { communityId: id },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              level: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.thread.count({ where: { communityId: id } }),
    ])

    const threadIds = threads.map(t => t.id)
    const likes = await prisma.threadLike.groupBy({
      by: ["threadId"],
      where: { threadId: { in: threadIds } },
      _count: true,
    })
    const likesMap = new Map(likes.map(l => [l.threadId, l._count]))

    const formattedThreads = threads.map(thread => ({
      ...thread,
      likesCount: likesMap.get(thread.id) || 0,
      repliesCount: thread._count.messages,
    }))

    return NextResponse.json({
      success: true,
      data: formattedThreads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[Community Threads API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch threads" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const { title, content } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: payload.userId,
        },
      },
    })

    if (!membership || membership.isBanned) {
      return NextResponse.json({ success: false, error: "Not a member of this community" }, { status: 403 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const thread = await prisma.thread.create({
      data: {
        communityId: id,
        authorId: payload.userId,
        title,
        content,
        slug: `${slug}-${Date.now()}`,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
      },
    })

    await xpService.awardXP(payload.userId, "post_created", thread.id, "thread")

    return NextResponse.json({
      success: true,
      data: {
        ...thread,
        likesCount: 0,
        repliesCount: 0,
      },
    })
  } catch (error) {
    console.error("[Community Threads API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create thread" }, { status: 500 })
  }
}
