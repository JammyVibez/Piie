import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ fusionId: string }> }
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

    const { fusionId } = await params

    // Track share (you can add a shares table later if needed)
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Share tracked"
    })
  } catch (error) {
    console.error("[Fusion Share API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to track share" }, { status: 500 })
  }
}

