import { NextResponse } from "next/server"
import { verifyToken, findUserById, getFollowCounts } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No authorization token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const user = await findUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const { followers, following } = await getFollowCounts(user.id)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          followers,
          following,
          joinedDate: user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        },
      },
    })
  } catch (error) {
    console.error("[v0] Get current user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
