import { NextResponse } from "next/server"
import { findUserByEmail, generateVerificationCode, storeVerificationCode } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      })
    }

    const code = generateVerificationCode()
    await storeVerificationCode(email, code)

    console.log(`[v0] Password reset code for ${email}: ${code}`)

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to email",
      _dev_code: code,
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
