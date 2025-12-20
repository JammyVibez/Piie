import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { challengeId } = await params

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    })

    if (!challenge) {
      return NextResponse.json({ success: false, error: "Challenge not found" }, { status: 404 })
    }

    if (challenge.status !== "active") {
      return NextResponse.json({ success: false, error: "Challenge is not active" }, { status: 400 })
    }

    // Check if user already has progress for this challenge
    const existingProgress = await prisma.challengeProgress.findUnique({
      where: {
        userId_challengeId: {
          userId: decoded.userId,
          challengeId: challengeId
        }
      }
    })

    if (existingProgress) {
      return NextResponse.json({ 
        success: true, 
        message: "Already joined this challenge",
        data: existingProgress 
      })
    }

    // Create challenge progress
    const progress = await prisma.challengeProgress.create({
      data: {
        userId: decoded.userId,
        challengeId: challengeId,
        currentValue: 0,
        isCompleted: false
      }
    })

    return NextResponse.json({
      success: true,
      data: progress,
      message: "Successfully joined challenge"
    })
  } catch (error) {
    console.error("[Join Challenge API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to join challenge" }, { status: 500 })
  }
}

