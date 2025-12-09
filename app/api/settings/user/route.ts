import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId: payload.userId },
    })

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: payload.userId },
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("[User Settings API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()

    const allowedFields = [
      "emailNotifications",
      "pushNotifications",
      "notifyLikes",
      "notifyComments",
      "notifyFollows",
      "notifyMentions",
      "notifyMessages",
      "profileVisibility",
      "showOnlineStatus",
      "allowMessages",
      "theme",
      "chatWallpaper",
      "language",
      "timezone",
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: payload.userId },
      update: updateData,
      create: {
        userId: payload.userId,
        ...updateData,
      },
    })

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("[User Settings API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
