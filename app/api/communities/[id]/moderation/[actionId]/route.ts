import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { id: communityId, actionId } = await params
    
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

    const { status } = await request.json()

    if (!status || !["resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ success: false, error: "Valid status required" }, { status: 400 })
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: actionId }
    })

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Action not found" }, { status: 404 })
    }

    if (existingReport.targetId !== communityId && existingReport.targetType !== "community") {
      const communityPosts = await prisma.post.findMany({
        where: { communityId },
        select: { id: true }
      })
      const isRelatedToThisCommunity = communityPosts.some(p => p.id === existingReport.targetId)
      if (!isRelatedToThisCommunity) {
        return NextResponse.json({ success: false, error: "Action not found in this community" }, { status: 404 })
      }
    }

    const report = await prisma.report.update({
      where: { id: actionId },
      data: { 
        status,
        resolvedAt: new Date(),
        resolvedById: decoded.userId
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        status: report.status
      }
    })
  } catch (error) {
    console.error("[Community Moderation API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update moderation action" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { id: communityId, actionId } = await params
    
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
        role: { in: ["admin", "owner"] }
      }
    })

    if (!membership) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: actionId }
    })

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Action not found" }, { status: 404 })
    }

    if (existingReport.targetId !== communityId && existingReport.targetType !== "community") {
      const communityPosts = await prisma.post.findMany({
        where: { communityId },
        select: { id: true }
      })
      const isRelatedToThisCommunity = communityPosts.some(p => p.id === existingReport.targetId)
      
      const communityMemberIds = await prisma.communityMember.findMany({
        where: { communityId },
        select: { userId: true }
      }).then(members => members.map(m => m.userId))
      const isReportedUserInCommunity = existingReport.reportedUserId && communityMemberIds.includes(existingReport.reportedUserId)
      
      if (!isRelatedToThisCommunity && !isReportedUserInCommunity) {
        return NextResponse.json({ success: false, error: "Action not found in this community" }, { status: 404 })
      }
    }

    await prisma.report.delete({
      where: { id: actionId }
    })

    return NextResponse.json({
      success: true,
      message: "Moderation action deleted"
    })
  } catch (error) {
    console.error("[Community Moderation API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete moderation action" }, { status: 500 })
  }
}
