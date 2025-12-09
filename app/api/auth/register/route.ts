import { NextResponse } from "next/server"
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  generateToken,
  validateEmail,
  validateUsername,
  validatePasswordStrength,
  getFollowCounts,
} from "@/lib/auth"

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { name, username, email, password, userRole } = body

    if (!name || !username || !email || !password || !userRole) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json({ success: false, error: usernameValidation.error }, { status: 400 })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, error: passwordValidation.errors[0] }, { status: 400 })
    }

    const existingEmail = await findUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 })
    }

    const existingUsername = await findUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json({ success: false, error: "Username already taken" }, { status: 409 })
    }

    const newUser = await createUser({
      name,
      username,
      email,
      password,
      userRole,
    })

    const token = await generateToken(newUser)
    const { followers, following } = await getFollowCounts(newUser.id)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...newUser,
          followers,
          following,
          joinedDate: newUser.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        },
        token,
      },
      message: "Registration successful",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
