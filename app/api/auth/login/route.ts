import { NextResponse } from "next/server"

// Lazy load auth functions to prevent import-time errors
async function getAuthFunctions() {
  try {
    const auth = await import("@/lib/auth")
    return {
      findUserWithPasswordByEmail: auth.findUserWithPasswordByEmail,
      validatePassword: auth.validatePassword,
      generateToken: auth.generateToken,
      getFollowCounts: auth.getFollowCounts,
    }
  } catch (error) {
    console.error("[Login API] Failed to import auth functions:", error)
    throw new Error("Auth module failed to load")
  }
}

export async function POST(request: Request) {
  // Ensure we always return JSON, even if there's an error before try-catch
  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[Login API] JSON parse error:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Lazy load auth functions
    const { findUserWithPasswordByEmail, validatePassword, generateToken, getFollowCounts } = await getAuthFunctions()

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
    console.error("[Login API] Error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      }, 
      { status: 500 }
    )
  }
}
