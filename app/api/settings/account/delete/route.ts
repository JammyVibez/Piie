import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken, validatePassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { password, confirmation } = await request.json()

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 })
    }

    if (confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json({ success: false, error: "Please type 'DELETE MY ACCOUNT' to confirm" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const isValid = await validatePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Password is incorrect" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: payload.userId },
    })

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("[Delete Account API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 })
  }
}
