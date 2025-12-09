import { NextResponse } from "next/server"
import { generateVerificationCode, storeVerificationCode, verifyCode, markEmailVerified, deleteVerificationCode } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (code) {
      const isValid = await verifyCode(email, code)
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Invalid or expired verification code" }, { status: 400 })
      }

      await markEmailVerified(email)
      await deleteVerificationCode(email)

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
      })
    }

    const verificationCode = generateVerificationCode()
    await storeVerificationCode(email, verificationCode)

    console.log(`[v0] Verification code for ${email}: ${verificationCode}`)

    return NextResponse.json({
      success: true,
      message: "Verification code sent to email",
      _dev_code: verificationCode,
    })
  } catch (error) {
    console.error("[v0] Verify email error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
