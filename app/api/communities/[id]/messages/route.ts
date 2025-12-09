import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search")?.toLowerCase()

    // Mock messages - replace with database query
    const mockMessages = Array.from({ length: 150 }, (_, i) => ({
      id: `msg-${i}`,
      communityId: params.id,
      userId: `user-${i % 5}`,
      content: `This is message ${i + 1}`,
      type: "text",
      reactions: {},
      isEdited: false,
      createdAt: new Date(Date.now() - i * 60000),
    }))

    let filtered = mockMessages
    if (search) {
      filtered = filtered.filter((m) => m.content.toLowerCase().includes(search))
    }

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end).reverse() // Newest first

    return NextResponse.json({
      success: true,
      data: {
        messages: paginated,
        pagination: { page, limit, total: filtered.length },
      },
    })
  } catch (error) {
    console.error("[v0] Messages fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { content, type = "text", userId } = body

    if (!content) {
      return NextResponse.json({ success: false, error: "Message content required" }, { status: 400 })
    }

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      communityId: params.id,
      userId,
      content,
      type,
      reactions: {},
      isEdited: false,
      createdAt: new Date(),
    }

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 })
  } catch (error) {
    console.error("[v0] Message creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create message" }, { status: 500 })
  }
}
