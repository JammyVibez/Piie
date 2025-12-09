import { NextResponse } from "next/server"
import { verifyCode, deleteVerificationCode, findUserByEmail, validatePasswordStrength, updatePassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    const isValidCode = await verifyCode(email, code)
    if (!isValidCode) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification code" }, { status: 400 })
    }

    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, error: passwordValidation.errors[0] }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    await updatePassword(email, newPassword)
    await deleteVerificationCode(email)

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
