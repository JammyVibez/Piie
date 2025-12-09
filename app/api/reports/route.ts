import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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
    const { targetId, targetType, reason, description } = body

    if (!targetId || !targetType || !reason) {
      return NextResponse.json({ success: false, error: "Target ID, type, and reason are required" }, { status: 400 })
    }

    const validReasons = ["spam", "harassment", "hate_speech", "violence", "nudity", "false_info", "copyright", "other"]
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ success: false, error: "Invalid report reason" }, { status: 400 })
    }

    const validTypes = ["post", "comment", "user", "community", "room", "message"]
    if (!validTypes.includes(targetType)) {
      return NextResponse.json({ success: false, error: "Invalid target type" }, { status: 400 })
    }

    let reportedUserId: string | null = null

    if (targetType === "post") {
      const post = await prisma.post.findUnique({ where: { id: targetId } })
      if (!post) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
      }
      reportedUserId = post.authorId
    } else if (targetType === "user") {
      const user = await prisma.user.findUnique({ where: { id: targetId } })
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      reportedUserId = user.id
    } else if (targetType === "comment") {
      const comment = await prisma.comment.findUnique({ where: { id: targetId } })
      if (!comment) {
        return NextResponse.json({ success: false, error: "Comment not found" }, { status: 404 })
      }
      reportedUserId = comment.authorId
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: decoded.userId,
        targetId,
        targetType,
      },
    })

    if (existingReport) {
      return NextResponse.json({ success: false, error: "You have already reported this content" }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: decoded.userId,
        reportedUserId,
        targetId,
        targetType,
        reason,
        description: description || null,
        status: "pending",
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        message: "Report submitted successfully. Our team will review it shortly.",
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[Reports API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit report" }, { status: 500 })
  }
}

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

    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: { workerRole: true },
    })

    if (!user || !["admin", "mod"].includes(user.workerRole || "")) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const where: Record<string, unknown> = {}
    if (status) {
      where.status = status
    }

    const skip = (page - 1) * limit

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          reported: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("[Reports API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 })
  }
}
