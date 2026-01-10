import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getAuthenticatedUser, findUserById, getFollowCounts } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(request)

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No authorization token provided" }, { status: 401 })
    }

    const user = await findUserById(currentUser.userId)
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
    console.error("[Auth ME] Get current user error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
