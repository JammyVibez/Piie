import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [
      totalUsers,
      totalPosts,
      totalCommunities,
      totalRooms,
      activeReports,
      resolvedReports,
      dismissedReports,
      bannedUsers,
      onlineUsers,
      totalComments,
      totalLikes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.community.count(),
      prisma.room.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.report.count({ where: { status: "resolved" } }),
      prisma.report.count({ where: { status: "dismissed" } }),
      prisma.communityMember.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.comment.count(),
      prisma.like.count(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          online: onlineUsers,
          banned: bannedUsers,
        },
        content: {
          posts: totalPosts,
          comments: totalComments,
          likes: totalLikes,
        },
        communities: {
          total: totalCommunities,
        },
        rooms: {
          active: totalRooms,
        },
        moderation: {
          activeReports,
          resolvedReports,
          dismissedReports,
        },
      },
    })
  } catch (error) {
    console.error("[Admin Stats API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
