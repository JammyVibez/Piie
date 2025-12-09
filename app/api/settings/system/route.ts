import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key) {
      const setting = await prisma.systemSetting.findUnique({
        where: { key },
      })

      return NextResponse.json({
        success: true,
        value: setting?.value || null,
        type: setting?.type || "string",
      })
    }

    const settings = await prisma.systemSetting.findMany()

    return NextResponse.json({
      success: true,
      data: settings.reduce((acc, s) => {
        acc[s.key] = { value: s.value, type: s.type }
        return acc
      }, {} as Record<string, { value: string; type: string }>),
    })
  } catch (error) {
    console.error("[System Settings API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { key, value, type = "string", description } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({ success: false, error: "Key and value are required" }, { status: 400 })
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value), type, description },
      create: { key, value: String(value), type, description },
    })

    return NextResponse.json({
      success: true,
      data: setting,
    })
  } catch (error) {
    console.error("[System Settings API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to save setting" }, { status: 500 })
  }
}
