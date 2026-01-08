import { prisma } from "@/lib/prisma"

export type ChallengeAction = 
  | "create_post"
  | "create_story"
  | "like_post"
  | "comment_post"
  | "share_post"
  | "follow_user"
  | "join_community"
  | "create_fusion"
  | "fork_fusion"

export async function updateChallengeProgress(userId: string, action: ChallengeAction, value: number = 1) {
  try {
    // 1. Find active challenges that match this action
    // We assume 'requirementType' field in Challenge model maps to these actions
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        status: "active",
        requirementType: action,
        // Check if challenge is currently running
        OR: [
          {
            startsAt: null,
            endsAt: null
          },
          {
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() }
          }
        ]
      }
    })

    if (activeChallenges.length === 0) return

    // 2. For each matching challenge, update progress
    for (const challenge of activeChallenges) {
      // Find existing progress
      const existingProgress = await prisma.challengeProgress.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id
          }
        }
      })

      if (existingProgress && existingProgress.isCompleted) {
        continue // Already completed
      }

      const currentVal = existingProgress ? existingProgress.currentValue : 0
      const newVal = currentVal + value
      const isCompleted = newVal >= challenge.targetValue

      if (existingProgress) {
        await prisma.challengeProgress.update({
          where: {
            id: existingProgress.id
          },
          data: {
            currentValue: newVal,
            isCompleted: isCompleted,
            completedAt: isCompleted ? new Date() : null
          }
        })
      } else {
        await prisma.challengeProgress.create({
          data: {
            userId,
            challengeId: challenge.id,
            currentValue: newVal,
            isCompleted: isCompleted,
            completedAt: isCompleted ? new Date() : null
          }
        })
      }

      // 3. If completed, award XP (and potentially badge)
      if (isCompleted) {
        // Award XP
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: challenge.xpReward }
          }
        })

        // TODO: Handle Badge Reward if applicable
        if (challenge.badgeRewardId) {
          // Check if user already has badge, if not add it
          // This depends on how user badges are stored (e.g. UserBadge table)
        }
      }
    }
  } catch (error) {
    console.error(`[Challenge Logic] Error updating progress for user ${userId} action ${action}:`, error)
  }
}
