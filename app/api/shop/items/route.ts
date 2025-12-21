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

    // Get all active shop items
    const items = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })

    // Get user's purchased items if authenticated
    let purchasedItemIds: string[] = []
    if (userId) {
      const purchases = await prisma.userPurchase.findMany({
        where: { userId },
        select: { shopItemId: true }
      })
      purchasedItemIds = purchases.map(p => p.shopItemId)
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        purchasedItems: purchasedItemIds
      }
    })
  } catch (error) {
    console.error("[Shop Items API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}
