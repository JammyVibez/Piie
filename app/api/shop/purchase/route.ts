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
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 })
    }

    // Get shop item
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId }
    })

    if (!shopItem) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    if (!shopItem.isActive) {
      return NextResponse.json({ success: false, error: "Item is not available" }, { status: 400 })
    }

    // Check stock
    if (shopItem.stock !== null && shopItem.stock <= 0) {
      return NextResponse.json({ success: false, error: "Item is out of stock" }, { status: 400 })
    }

    // Get user with current coins
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, coins: true, xp: true }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Use coins if available, otherwise use xp
    const userBalance = user.coins || user.xp || 0

    // Check if user has enough balance
    if (userBalance < shopItem.price) {
      return NextResponse.json({ 
        success: false, 
        error: `Not enough coins. You need ${shopItem.price} coins but only have ${userBalance}` 
      }, { status: 400 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.userPurchase.findUnique({
      where: {
        userId_shopItemId: {
          userId: decoded.userId,
          shopItemId: itemId
        }
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ 
        success: false, 
        error: "You already own this item" 
      }, { status: 400 })
    }

    // Deduct coins and save purchase
    await prisma.$transaction(async (tx) => {
      // Update user balance
      if (user.coins !== null && user.coins >= shopItem.price) {
        await tx.user.update({
          where: { id: decoded.userId },
          data: { coins: { decrement: shopItem.price } }
        })
      } else {
        // Use xp if coins not available
        await tx.user.update({
          where: { id: decoded.userId },
          data: { xp: { decrement: shopItem.price } }
        })
      }

      // Create purchase record
      await tx.userPurchase.create({
        data: {
          userId: decoded.userId,
          shopItemId: itemId,
          price: shopItem.price
        }
      })

      // Update stock if limited
      if (shopItem.stock !== null) {
        await tx.shopItem.update({
          where: { id: itemId },
          data: { stock: { decrement: 1 } }
        })
      }
    })

    // Get updated user balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { coins: true, xp: true }
    })

    const newBalance = (updatedUser?.coins || updatedUser?.xp || 0)

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully purchased ${shopItem.name}!`,
        newBalance
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
