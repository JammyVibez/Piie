import { NextResponse } from "next/server"
import { findUserWithPasswordByEmail, validatePassword, generateToken, getFollowCounts } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const user = await findUserWithPasswordByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const isValidPassword = await validatePassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    const token = await generateToken(user)
    const { followers, following } = await getFollowCounts(user.id)

    const { passwordHash: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          followers,
          following,
          joinedDate: user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        },
        token,
      },
      message: "Login successful",
    })

    // Set cookie for session persistence
    response.cookies.set("auth_token", token, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
