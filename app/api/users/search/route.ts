import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.toLowerCase()
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 1) {
      return NextResponse.json({ success: false, error: "Query required" }, { status: 400 })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        level: true,
        xp: true,
        userRole: true,
        workerRole: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("[User Search API] Error:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}
