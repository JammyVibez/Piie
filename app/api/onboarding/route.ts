import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: payload.userId },
    })

    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: { userId: payload.userId },
      })
    }

    return NextResponse.json({
      success: true,
      data: onboarding,
    })
  } catch (error) {
    console.error("[Onboarding API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch onboarding" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const {
      step,
      completedStep,
      selectedInterests,
      selectedRole,
      profileCompleted,
      firstPostCreated,
      firstFollowDone,
      tutorialCompleted,
      isCompleted,
    } = body

    const updateData: Record<string, unknown> = {}

    if (step !== undefined) updateData.step = step
    if (selectedInterests) updateData.selectedInterests = selectedInterests
    if (selectedRole) {
      updateData.selectedRole = selectedRole
      await prisma.user.update({
        where: { id: payload.userId },
        data: { userRole: selectedRole },
      })
    }
    if (profileCompleted !== undefined) updateData.profileCompleted = profileCompleted
    if (firstPostCreated !== undefined) updateData.firstPostCreated = firstPostCreated
    if (firstFollowDone !== undefined) updateData.firstFollowDone = firstFollowDone
    if (tutorialCompleted !== undefined) updateData.tutorialCompleted = tutorialCompleted

    if (completedStep) {
      const current = await prisma.userOnboarding.findUnique({
        where: { userId: payload.userId },
      })
      const completedSteps = current?.completedSteps || []
      if (!completedSteps.includes(completedStep)) {
        updateData.completedSteps = [...completedSteps, completedStep]
      }
    }

    if (isCompleted) {
      updateData.isCompleted = true
      updateData.completedAt = new Date()

      await xpService.awardXP(payload.userId, "first_post", payload.userId, "onboarding", 200)

      const welcomeBadge = await prisma.badge.findUnique({
        where: { name: "Welcome" },
      })
      if (welcomeBadge) {
        await xpService.awardBadge(payload.userId, welcomeBadge.id)
      }
    }

    const onboarding = await prisma.userOnboarding.upsert({
      where: { userId: payload.userId },
      update: updateData,
      create: {
        userId: payload.userId,
        ...updateData,
      },
    })

    return NextResponse.json({
      success: true,
      data: onboarding,
    })
  } catch (error) {
    console.error("[Onboarding API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to update onboarding" }, { status: 500 })
  }
}
