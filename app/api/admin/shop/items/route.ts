import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { workerRole: true }
    })

    if (!user || user.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const items = await prisma.shopItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: items.map(item => ({
        ...item,
        purchaseCount: item._count.purchases
      }))
    })
  } catch (error) {
    console.error("[Admin Shop API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch shop items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { workerRole: true }
    })

    if (!user || user.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, category, icon, rarity, stock } = body

    if (!name || !description || !price || !category) {
      return NextResponse.json({ success: false, error: "Name, description, price, and category are required" }, { status: 400 })
    }

    const item = await prisma.shopItem.create({
      data: {
        name,
        description,
        price: parseInt(price),
        category,
        icon: icon || "🛍️",
        rarity: rarity || "common",
        stock: stock ? parseInt(stock) : null,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: item
    }, { status: 201 })
  } catch (error) {
    console.error("[Admin Shop API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create shop item" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { workerRole: true }
    })

    if (!user || user.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")
    if (!itemId) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 })
    }

    const body = await request.json()
    const item = await prisma.shopItem.update({
      where: { id: itemId },
      data: body
    })

    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error("[Admin Shop API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update shop item" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { workerRole: true }
    })

    if (!user || user.workerRole !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")
    if (!itemId) {
      return NextResponse.json({ success: false, error: "Item ID required" }, { status: 400 })
    }

    await prisma.shopItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully"
    })
  } catch (error) {
    console.error("[Admin Shop API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete shop item" }, { status: 500 })
  }
}



