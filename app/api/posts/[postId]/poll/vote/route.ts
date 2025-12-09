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
    const { optionId } = await request.json()

    if (!optionId) {
      return NextResponse.json({ success: false, error: "Option ID is required" }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        poll: {
          include: {
            options: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    if (!post.poll) {
      return NextResponse.json({ success: false, error: "This post is not a poll" }, { status: 400 })
    }

    const option = post.poll.options.find((opt) => opt.id === optionId)
    if (!option) {
      return NextResponse.json({ success: false, error: "Invalid option" }, { status: 400 })
    }

    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId: post.poll.id,
        userId: decoded.userId,
      },
    })

    if (existingVote) {
      return NextResponse.json({ success: false, error: "Already voted on this poll" }, { status: 400 })
    }

    if (post.poll.endsAt && new Date(post.poll.endsAt) < new Date()) {
      return NextResponse.json({ success: false, error: "This poll has ended" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.pollVote.create({
        data: {
          pollId: post.poll.id,
          userId: decoded.userId,
          optionId,
        },
      }),
      prisma.pollOption.update({
        where: { id: optionId },
        data: { votes: { increment: 1 } },
      }),
      prisma.poll.update({
        where: { id: post.poll.id },
        data: { totalVotes: { increment: 1 } },
      }),
    ])

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: post.poll.id },
      include: { options: true },
    })

    if (!updatedPoll) {
      return NextResponse.json({ success: false, error: "Failed to fetch updated poll" }, { status: 500 })
    }

    const optionsWithPercentage = updatedPoll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      percentage: updatedPoll.totalVotes > 0 
        ? Math.round((opt.votes / updatedPoll.totalVotes) * 100) 
        : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        options: optionsWithPercentage,
        totalVotes: updatedPoll.totalVotes,
        votedOptionId: optionId,
        hasVoted: true,
      },
    })
  } catch (error) {
    console.error("[Poll Vote API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to vote" }, { status: 500 })
  }
}
