import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, itemName, price, category } = body

    if (!itemId || !itemName || !price) {
      return NextResponse.json({ success: false, error: "Item details required" }, { status: 400 })
    }

    // Get user with current XP (using XP as coins)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, xp: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if user has enough coins (XP)
    if (user.xp < price) {
      return NextResponse.json({ 
        success: false, 
        error: "Not enough coins. You need " + price + " coins but only have " + user.xp 
      }, { status: 400 })
    }

    // Get or create user settings to store purchases
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: decoded.userId }
    })

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: { userId: decoded.userId }
      })
    }

    // Check purchases stored in chatWallpaper field (repurposing it as JSON storage)
    let purchases: any[] = []
    try {
      purchases = userSettings.chatWallpaper ? JSON.parse(userSettings.chatWallpaper) : []
    } catch {
      purchases = []
    }

    // Check if item already purchased
    if (purchases.some((p: any) => p.itemId === itemId)) {
      return NextResponse.json({ 
        success: false, 
        error: "You already own this item" 
      }, { status: 400 })
    }

    // Deduct coins and save purchase
    const newPurchase = {
      itemId,
      itemName,
      price,
      category: category || 'other',
      purchasedAt: new Date().toISOString()
    }

    purchases.push(newPurchase)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: { xp: { decrement: price } }
      }),
      prisma.userSettings.update({
        where: { userId: decoded.userId },
        data: { chatWallpaper: JSON.stringify(purchases) }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully purchased ${itemName}!`,
        newBalance: user.xp - price
      }
    })
  } catch (error) {
    console.error("[Shop Purchase API] Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to process purchase" 
    }, { status: 500 })
  }
}

