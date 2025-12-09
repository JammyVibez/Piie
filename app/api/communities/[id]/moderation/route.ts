import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          where: { userId: decoded.userId },
          select: { role: true }
        },
        _count: {
          select: { 
            members: true,
            posts: true
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json({ success: false, error: "Community not found" }, { status: 404 })
    }

    const userMembership = community.members[0]
    if (!userMembership || !["admin", "moderator", "owner"].includes(userMembership.role)) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const communityPosts = await prisma.post.findMany({
      where: { communityId },
      select: { id: true }
    })
    const communityPostIds = communityPosts.map(p => p.id)

    const communityMemberIds = await prisma.communityMember.findMany({
      where: { communityId },
      select: { userId: true }
    }).then(members => members.map(m => m.userId))

    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { targetId: { in: communityPostIds }, targetType: "post" },
          { reportedUserId: { in: communityMemberIds } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        reporter: {
          select: { id: true, name: true, username: true, avatar: true }
        },
        reported: {
          select: { id: true, name: true, username: true, avatar: true }
        }
      }
    })

    const actions = reports.map(report => {
      let actionType: "warning" | "mute" | "ban" | "remove-post" = "warning"
      
      if (report.reason === "ban" || report.description?.startsWith("[BAN]")) {
        actionType = "ban"
      } else if (report.reason === "mute" || report.description?.startsWith("[MUTE]")) {
        actionType = "mute"
      } else if (report.reason === "remove-post" || report.targetType === "post") {
        actionType = "remove-post"
      }

      return {
        id: report.id,
        type: actionType,
        user: report.reported?.name || report.reported?.username || "Unknown User",
        reason: report.description?.replace(/^\[(BAN|MUTE|WARNING)\]\s*/i, "") || report.reason,
        date: formatRelativeTime(report.createdAt),
        status: report.status === "pending" ? "active" : "resolved"
      }
    })

    const activeToday = await prisma.user.count({
      where: {
        id: { in: communityMemberIds },
        lastActive: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        actions,
        stats: {
          members: community._count.members,
          posts: community._count.posts,
          activeToday
        }
      }
    })
  } catch (error) {
    console.error("[Community Moderation API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch moderation data" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: communityId } = await params
    
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const membership = await prisma.communityMember.findFirst({
      where: { 
        communityId, 
        userId: decoded.userId,
        role: { in: ["admin", "moderator", "owner"] }
      }
    })

    if (!membership) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { type, targetUserId, reason } = await request.json()

    if (!type || !targetUserId || !reason) {
      return NextResponse.json({ success: false, error: "Type, target user, and reason are required" }, { status: 400 })
    }

    const targetMember = await prisma.communityMember.findFirst({
      where: { communityId, userId: targetUserId }
    })

    if (!targetMember) {
      return NextResponse.json({ success: false, error: "User is not a member of this community" }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: decoded.userId,
        reportedUserId: targetUserId,
        targetId: communityId,
        targetType: "community",
        reason: type,
        description: `[${type.toUpperCase()}] ${reason}`,
        status: "pending"
      }
    })

    if (type === "ban") {
      await prisma.communityMember.updateMany({
        where: { communityId, userId: targetUserId },
        data: { role: "banned" }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        type,
        user: targetUserId,
        reason,
        date: "now",
        status: "active"
      }
    }, { status: 201 })
  } catch (error) {
    console.error("[Community Moderation API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create moderation action" }, { status: 500 })
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
