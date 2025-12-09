import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const search = searchParams.get("search")?.toLowerCase()

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    if (category && category !== "All") {
      where.category = category
    }

    const communities = await prisma.community.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { members: true, threads: true },
        },
      },
    })

    const total = await prisma.community.count({ where })

    const formattedCommunities = communities.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.avatar || "🌟",
      banner: c.banner,
      category: c.category,
      members: c._count.members,
      posts: c.postsCount,
      online: c.onlineCount,
      trending: c._count.members > 100,
      isPublic: c.privacy === "public",
      createdAt: c.createdAt,
      owner: c.owner,
    }))

    return NextResponse.json({
      success: true,
      data: {
        communities: formattedCommunities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("[Communities API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch communities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, isPublic, avatar, banner } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Community name required" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const existingCommunity = await prisma.community.findUnique({
      where: { slug },
    })

    if (existingCommunity) {
      return NextResponse.json({ success: false, error: "A community with this name already exists" }, { status: 400 })
    }

    const community = await prisma.community.create({
      data: {
        name,
        slug,
        description,
        privacy: isPublic ? "public" : "private",
        avatar,
        banner,
        category: category || "General",
        ownerId: decoded.userId,
        members: {
          create: {
            userId: decoded.userId,
            role: "admin",
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        icon: community.avatar || "🌟",
        category: community.category,
        isPublic: community.privacy === "public",
        members: community._count.members,
        createdAt: community.createdAt,
        owner: community.owner,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[Communities API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create community" }, { status: 500 })
  }
}
