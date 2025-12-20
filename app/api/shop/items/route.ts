import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Get user's purchased items if authenticated
    let purchasedItems: string[] = []
    if (userId) {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId },
        select: { chatWallpaper: true }
      })

      if (userSettings?.chatWallpaper) {
        try {
          const purchases = JSON.parse(userSettings.chatWallpaper)
          purchasedItems = purchases.map((p: any) => p.itemId)
        } catch {
          purchasedItems = []
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        purchasedItems
      }
    })
  } catch (error) {
    console.error("[Shop Items API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}

