import { prisma } from "./prisma"

export async function calculateInfluenceScore(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  })

  if (!user) return 0

  const postsCount = user._count.posts
  const followersCount = user._count.followers

  const postsWithEngagement = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      _count: { select: { likedBy: true, comments: true } },
    },
  })

  let totalLikes = 0
  let totalComments = 0
  for (const post of postsWithEngagement) {
    totalLikes += post._count.likedBy
    totalComments += post._count.comments
  }

  const badgesCount = await prisma.userBadge.count({
    where: { userId },
  })

  const achievementsCount = await prisma.userAchievement.count({
    where: { userId },
  })

  const challengesCompleted = await prisma.challengeProgress.count({
    where: { userId, isCompleted: true },
  })

  const score =
    followersCount * 10 +
    postsCount * 5 +
    totalLikes * 2 +
    totalComments * 3 +
    badgesCount * 50 +
    achievementsCount * 100 +
    challengesCompleted * 25 +
    user.level * 20

  return score
}

export async function updateInfluenceScore(userId: string): Promise<number> {
  const score = await calculateInfluenceScore(userId)

  await prisma.user.update({
    where: { id: userId },
    data: { influenceScore: score },
  })

  return score
}

export async function updateChallengeProgress(
  userId: string,
  requirement: string,
  incrementBy: number = 1
): Promise<void> {
  const activeChallenges = await prisma.challenge.findMany({
    where: {
      requirement,
      status: "active",
    },
  })

  for (const challenge of activeChallenges) {
    const existingProgress = await prisma.challengeProgress.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
    })

    if (existingProgress?.isCompleted) {
      continue
    }

    const newValue = (existingProgress?.currentValue || 0) + incrementBy
    const isCompleted = newValue >= challenge.targetValue

    await prisma.challengeProgress.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
      update: {
        currentValue: newValue,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId,
        challengeId: challenge.id,
        currentValue: newValue,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    if (isCompleted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: challenge.xpReward },
        },
      })

      if (challenge.badgeRewardId) {
        const existingBadge = await prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: challenge.badgeRewardId,
            },
          },
        })

        if (!existingBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: challenge.badgeRewardId,
            },
          })
        }
      }

      await updateInfluenceScore(userId)
      await checkLevelUp(userId)
    }
  }
}

export async function checkLevelUp(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  })

  if (!user) return false

  const xpThresholds = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000,
    18000, 26000, 36000, 50000, 70000, 100000, 150000, 220000, 320000, 500000
  ]

  let newLevel = 1
  for (let i = 0; i < xpThresholds.length; i++) {
    if (user.xp >= xpThresholds[i]) {
      newLevel = i + 1
    } else {
      break
    }
  }

  if (newLevel > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    })

    await prisma.notification.create({
      data: {
        recipientId: userId,
        type: "system",
        content: JSON.stringify({
          message: `Congratulations! You've reached Level ${newLevel}!`,
          type: "level_up",
        }),
      },
    })

    return true
  }

  return false
}

export async function awardBadge(userId: string, badgeName: string): Promise<boolean> {
  const badge = await prisma.badge.findFirst({
    where: { name: badgeName },
  })

  if (!badge) return false

  const existingBadge = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id,
      },
    },
  })

  if (existingBadge) return false

  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
  })

  await prisma.notification.create({
    data: {
      recipientId: userId,
      type: "system",
      content: JSON.stringify({
        message: `You've earned the "${badge.name}" badge!`,
        type: "badge_earned",
        badgeId: badge.id,
        badgeIcon: badge.icon,
      }),
    },
  })

  await updateInfluenceScore(userId)

  return true
}

export async function checkAndAwardAutomaticBadges(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          followers: true,
          posts: true,
        },
      },
      badges: true,
    },
  })

  if (!user) return

  const badgeChecks = [
    { name: "First Post", condition: user._count.posts >= 1 },
    { name: "Content Creator", condition: user._count.posts >= 10 },
    { name: "Prolific Writer", condition: user._count.posts >= 50 },
    { name: "Rising Star", condition: user._count.followers >= 10 },
    { name: "Influencer", condition: user._count.followers >= 100 },
    { name: "Social Butterfly", condition: user._count.followers >= 500 },
    { name: "Level 5", condition: user.level >= 5 },
    { name: "Level 10", condition: user.level >= 10 },
  ]

  for (const { name, condition } of badgeChecks) {
    if (condition) {
      await awardBadge(userId, name)
    }
  }
}