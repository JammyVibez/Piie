import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
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

    const { userId } = await params

    if (decoded.userId !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { bio, location, avatar, interests, followingUserIds } = body

    await prisma.user.update({
      where: { id: userId },
      data: {
        bio: bio || undefined,
        location: location || undefined,
        avatar: avatar || undefined,
      },
    })

    if (interests && interests.length > 0) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: {
          preferences: { interests },
        },
        create: {
          userId,
          preferences: { interests },
        },
      })
    }

    if (followingUserIds && followingUserIds.length > 0) {
      const followPromises = followingUserIds.map(async (followingId: string) => {
        const existingFollow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId,
            },
          },
        })

        if (!existingFollow) {
          return prisma.follow.create({
            data: {
              followerId: userId,
              followingId,
            },
          })
        }
        return null
      })

      await Promise.all(followPromises)
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPreference: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Onboarding completed successfully",
    })
  } catch (error) {
    console.error("[Onboarding API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to complete onboarding" }, { status: 500 })
  }
}
