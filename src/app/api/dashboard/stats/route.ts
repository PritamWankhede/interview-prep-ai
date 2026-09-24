import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const cacheKey = CacheKeys.dashboardStats(userId)

    const stats = await withCache(cacheKey, TTL.STATS, async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const [
        totalSessions,
        evaluatedSessions,
        recentSessions,
        categoryStats,
        weeklyProgress,
        streak,
      ] = await Promise.all([
        // Total sessions
        prisma.practiceSession.count({ where: { userId } }),

        // Evaluated sessions with scores
        prisma.practiceSession.findMany({
          where: { userId, status: 'EVALUATED' },
          include: {
            feedback: { select: { overallScore: true } },
            question: { select: { category: true } },
          },
        }),

        // Last 5 sessions
        prisma.practiceSession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            question: { select: { title: true, difficulty: true, category: true } },
            feedback: { select: { overallScore: true } },
          },
        }),

        // Category breakdown
        prisma.practiceSession.groupBy({
          by: ['questionId'],
          where: { userId, status: 'EVALUATED' },
          _count: true,
        }),

        // Weekly progress (last 7 days)
        prisma.userProgress.findMany({
          where: {
            userId,
            date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          orderBy: { date: 'asc' },
        }),

        // Current streak
        prisma.userProgress.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 30,
        }),
      ])

      // Calculate average score
      const avgScore =
        evaluatedSessions.length > 0
          ? Math.round(
              evaluatedSessions.reduce(
                (sum, s) => sum + (s.feedback?.overallScore ?? 0),
                0
              ) / evaluatedSessions.length
            )
          : 0

      // Calculate category scores
      const catMap: Record<string, { total: number; count: number }> = {}
      for (const s of evaluatedSessions) {
        const cat = s.question.category
        if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 }
        catMap[cat].total += s.feedback?.overallScore ?? 0
        catMap[cat].count += 1
      }
      const scoresByCategory = Object.entries(catMap).map(([category, data]) => ({
        category,
        avgScore: Math.round(data.total / data.count),
        count: data.count,
      }))

      // Calculate streak
      let currentStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      for (const progress of streak) {
        const progressDate = new Date(progress.date)
        progressDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor(
          (today.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (diffDays === currentStreak) {
          currentStreak++
        } else {
          break
        }
      }

      // Format weekly progress
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0, 0, 0, 0)
        return date.toISOString().split('T')[0]
      })

      const progressMap = new Map(
        weeklyProgress.map((p) => [
          new Date(p.date).toISOString().split('T')[0],
          { count: p.questionsCount, avgScore: p.avgScore },
        ])
      )

      const formattedWeekly = last7Days.map((date) => ({
        date,
        count: progressMap.get(date)?.count ?? 0,
        avgScore: progressMap.get(date)?.avgScore ?? 0,
      }))

      return {
        totalSessions,
        avgScore,
        currentStreak,
        totalEvaluated: evaluatedSessions.length,
        scoresByCategory,
        recentSessions,
        weeklyProgress: formattedWeekly,
      }
    })

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('[DASHBOARD_STATS_ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
