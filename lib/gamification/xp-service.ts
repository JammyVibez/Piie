import prisma from "@/lib/prisma"
import { XPEventType } from "@/generated/prisma/enums"

const XP_VALUES: Record<XPEventType, number> = {
  post_created: 50,
  comment_added: 20,
  like_received: 5,
  like_given: 2,
  follow_received: 15,
  follow_given: 5,
  challenge_completed: 100,
  achievement_unlocked: 75,
  badge_earned: 50,
  login_streak: 25,
  first_post: 100,
  first_comment: 50,
  community_joined: 30,
  room_created: 40,
  room_participated: 20,
  fusion_contributed: 35,
}

const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11
  6600,   // Level 12
  7800,   // Level 13
  9100,   // Level 14
  10500,  // Level 15
  12000,  // Level 16
  13600,  // Level 17
  15300,  // Level 18
  17100,  // Level 19
  19000,  // Level 20
]

export class XPService {
  async awardXP(
    userId: string,
    type: XPEventType,
    sourceId?: string,
    sourceType?: string,
    customXP?: number
  ): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const xpAmount = customXP ?? XP_VALUES[type] ?? 0

    await prisma.xPEvent.create({
      data: {
        userId,
        type,
        xpAmount,
        sourceId,
        sourceType,
      },
    })

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpAmount },
      },
      select: { xp: true, level: true },
    })

    const newLevel = this.calculateLevel(user.xp)
    const leveledUp = newLevel > user.level

    if (leveledUp) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      })

      await this.checkLevelAchievements(userId, newLevel)
    }

    await this.updateLeaderboard(userId, xpAmount)
    await this.checkChallengeProgress(userId, type)

    return {
      newXP: user.xp,
      newLevel,
      leveledUp,
    }
  }

  calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1
      }
    }
    return 1
  }

  getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 2000
    }
    return LEVEL_THRESHOLDS[currentLevel]
  }

  getXPProgress(xp: number, level: number): { current: number; required: number; percentage: number } {
    const currentThreshold = level > 1 ? LEVEL_THRESHOLDS[level - 1] : 0
    const nextThreshold = this.getXPForNextLevel(level)
    const current = xp - currentThreshold
    const required = nextThreshold - currentThreshold
    const percentage = Math.min(100, Math.floor((current / required) * 100))

    return { current, required, percentage }
  }

  private async updateLeaderboard(userId: string, xpAmount: number): Promise<void> {
    const activeSeason = await prisma.leaderboardSeason.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) return

    await prisma.leaderboardEntry.upsert({
      where: {
        userId_seasonId: {
          userId,
          seasonId: activeSeason.id,
        },
      },
      update: {
        xpEarned: { increment: xpAmount },
      },
      create: {
        userId,
        seasonId: activeSeason.id,
        xpEarned: xpAmount,
      },
    })
  }

  private async checkChallengeProgress(userId: string, eventType: XPEventType): Promise<void> {
    const eventToRequirement: Partial<Record<XPEventType, string>> = {
      post_created: "create_posts",
      comment_added: "add_comments",
      like_given: "give_likes",
      follow_given: "follow_users",
      community_joined: "join_communities",
      room_participated: "join_rooms",
    }

    const requirement = eventToRequirement[eventType]
    if (!requirement) return

    const activeChallenges = await prisma.challenge.findMany({
      where: {
        status: "active",
        requirement,
        OR: [
          { endsAt: null },
          { endsAt: { gt: new Date() } },
        ],
      },
    })

    for (const challenge of activeChallenges) {
      const progress = await prisma.challengeProgress.upsert({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
        update: {
          currentValue: { increment: 1 },
        },
        create: {
          userId,
          challengeId: challenge.id,
          currentValue: 1,
        },
      })

      if (progress.currentValue >= challenge.targetValue && !progress.isCompleted) {
        await this.completeChallenge(userId, challenge.id)
      }
    }
  }

  async completeChallenge(userId: string, challengeId: string): Promise<void> {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { badgeReward: true },
    })

    if (!challenge) return

    await prisma.challengeProgress.update({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    await this.awardXP(userId, "challenge_completed", challengeId, "challenge", challenge.xpReward)

    if (challenge.badgeRewardId) {
      await this.awardBadge(userId, challenge.badgeRewardId)
    }

    await prisma.notification.create({
      data: {
        recipientId: userId,
        type: "system",
        title: "Challenge Completed!",
        message: `You completed the challenge: ${challenge.title}`,
        targetId: challengeId,
        targetType: "challenge",
      },
    })
  }

  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    })

    if (existing) return false

    await prisma.userBadge.create({
      data: {
        userId,
        badgeId,
      },
    })

    await this.awardXP(userId, "badge_earned", badgeId, "badge")

    const badge = await prisma.badge.findUnique({ where: { id: badgeId } })
    if (badge) {
      await prisma.notification.create({
        data: {
          recipientId: userId,
          type: "system",
          title: "New Badge Earned!",
          message: `You earned the ${badge.name} badge!`,
          targetId: badgeId,
          targetType: "badge",
        },
      })
    }

    return true
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    })

    if (existing) return false

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
      },
    })

    await this.awardXP(userId, "achievement_unlocked", achievementId, "achievement")

    const achievement = await prisma.achievement.findUnique({ where: { id: achievementId } })
    if (achievement) {
      await prisma.notification.create({
        data: {
          recipientId: userId,
          type: "system",
          title: "Achievement Unlocked!",
          message: `You unlocked: ${achievement.name}`,
          targetId: achievementId,
          targetType: "achievement",
        },
      })
    }

    return true
  }

  private async checkLevelAchievements(userId: string, level: number): Promise<void> {
    const levelAchievements: Record<number, string> = {
      5: "Rising Star",
      10: "Established Member",
      15: "Community Pillar",
      20: "Legend",
    }

    const achievementName = levelAchievements[level]
    if (achievementName) {
      const achievement = await prisma.achievement.findUnique({
        where: { name: achievementName },
      })
      if (achievement) {
        await this.unlockAchievement(userId, achievement.id)
      }
    }
  }
}

export const xpService = new XPService()
export default XPService
