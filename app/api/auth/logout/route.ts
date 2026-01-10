import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { getTokenFromRequest, deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (token) {
      await deleteSession(token).catch(() => {
        // Session deletion is optional, don't fail logout if it fails
      })
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    })

    // Clear auth cookie
    response.cookies.set("auth_token", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[Logout API] Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
