import prisma from "@/lib/prisma"

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  name: string
  avatar: string | null
  xpEarned: number
  level: number
  badges: number
}

export class LeaderboardService {
  async getGlobalLeaderboard(limit: number = 50, offset: number = 0): Promise<LeaderboardEntry[]> {
    const users = await prisma.user.findMany({
      orderBy: [
        { xp: "desc" },
        { level: "desc" },
      ],
      take: limit,
      skip: offset,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        _count: {
          select: { badges: true },
        },
      },
    })

    return users.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      xpEarned: user.xp,
      level: user.level,
      badges: user._count.badges,
    }))
  }

  async getSeasonLeaderboard(seasonId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const entries = await prisma.leaderboardEntry.findMany({
      where: { seasonId },
      orderBy: { xpEarned: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            name: true,
            avatar: true,
            level: true,
            _count: {
              select: { badges: true },
            },
          },
        },
      },
    })

    return entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.user.username,
      name: entry.user.name,
      avatar: entry.user.avatar,
      xpEarned: entry.xpEarned,
      level: entry.user.level,
      badges: entry.user._count.badges,
    }))
  }

  async getActiveSeasonLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const activeSeason = await prisma.leaderboardSeason.findFirst({
      where: { isActive: true },
    })

    if (!activeSeason) {
      return this.getGlobalLeaderboard(limit)
    }

    return this.getSeasonLeaderboard(activeSeason.id, limit)
  }

  async getUserRank(userId: string): Promise<{ global: number; season: number | null }> {
    const globalRank = await prisma.user.count({
      where: {
        xp: {
          gt: (await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } }))?.xp ?? 0,
        },
      },
    })

    const activeSeason = await prisma.leaderboardSeason.findFirst({
      where: { isActive: true },
    })

    let seasonRank: number | null = null

    if (activeSeason) {
      const userEntry = await prisma.leaderboardEntry.findUnique({
        where: {
          userId_seasonId: {
            userId,
            seasonId: activeSeason.id,
          },
        },
      })

      if (userEntry) {
        seasonRank = await prisma.leaderboardEntry.count({
          where: {
            seasonId: activeSeason.id,
            xpEarned: { gt: userEntry.xpEarned },
          },
        }) + 1
      }
    }

    return {
      global: globalRank + 1,
      season: seasonRank,
    }
  }

  async updateRanks(seasonId: string): Promise<void> {
    const entries = await prisma.leaderboardEntry.findMany({
      where: { seasonId },
      orderBy: { xpEarned: "desc" },
    })

    await Promise.all(
      entries.map((entry, index) =>
        prisma.leaderboardEntry.update({
          where: { id: entry.id },
          data: { rank: index + 1 },
        })
      )
    )
  }

  async createSeason(name: string, startsAt: Date, endsAt: Date): Promise<{ id: string }> {
    await prisma.leaderboardSeason.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    const season = await prisma.leaderboardSeason.create({
      data: {
        name,
        startsAt,
        endsAt,
        isActive: true,
      },
    })

    return { id: season.id }
  }

  async getWeeklyTopUsers(limit: number = 10): Promise<LeaderboardEntry[]> {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const xpEvents = await prisma.xPEvent.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: weekAgo },
      },
      _sum: {
        xpAmount: true,
      },
      orderBy: {
        _sum: {
          xpAmount: "desc",
        },
      },
      take: limit,
    })

    const userIds = xpEvents.map((e) => e.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
        xp: true,
        _count: {
          select: { badges: true },
        },
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    return xpEvents.map((event, index) => {
      const user = userMap.get(event.userId)!
      return {
        rank: index + 1,
        userId: event.userId,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        xpEarned: event._sum.xpAmount ?? 0,
        level: user.level,
        badges: user._count.badges,
      }
    })
  }
}

export const leaderboardService = new LeaderboardService()
export default LeaderboardService
