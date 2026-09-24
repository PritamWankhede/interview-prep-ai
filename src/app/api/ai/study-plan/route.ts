import { createGroq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! })

const studyPlanSchema = z.object({
  overallAssessment: z.string().describe('Brief assessment of the user overall performance'),
  weakAreas: z.array(z.string()).describe('Categories where the user needs most improvement'),
  strongAreas: z.array(z.string()).describe('Categories where the user is performing well'),
  days: z
    .array(
      z.object({
        day: z.number().min(1).max(7),
        focus: z.string().describe('Main topic for the day'),
        goal: z.string().describe('Specific learning goal'),
        suggestedQuestionCount: z.number().min(1).max(5),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
        tip: z.string().describe('A practical, actionable tip for this topic'),
      })
    )
    .length(7),
  immediate: z.array(z.string()).max(3).describe('Top 3 things to focus on right now'),
  thisWeek: z.array(z.string()).max(3).describe('Goals for this week'),
})

// ─── GET /api/ai/study-plan ──────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const cacheKey = CacheKeys.studyPlan(userId)

    const plan = await withCache(cacheKey, TTL.STUDY_PLAN, async () => {
      // Gather user performance data
      const recentSessions = await prisma.practiceSession.findMany({
        where: { userId, status: 'EVALUATED' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          question: { select: { category: true, difficulty: true } },
          feedback: { select: { overallScore: true } },
        },
      })

      // Compute category averages
      const categoryScores: Record<string, { total: number; count: number }> = {}
      for (const s of recentSessions) {
        const cat = s.question.category
        if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 }
        categoryScores[cat].total += s.feedback?.overallScore ?? 0
        categoryScores[cat].count += 1
      }

      const categoryAverages = Object.entries(categoryScores).map(([category, data]) => ({
        category,
        avgScore: Math.round(data.total / data.count),
        sessionCount: data.count,
      }))

      const totalSessions = recentSessions.length
      const overallAvg =
        totalSessions > 0
          ? Math.round(
              recentSessions.reduce((sum, s) => sum + (s.feedback?.overallScore ?? 0), 0) /
                totalSessions
            )
          : 0

      // Generate study plan with AI
      const { object } = await generateObject({
        model: groq('openai/gpt-oss-20b'),
        schema: studyPlanSchema,
        system: `You are an expert career coach specializing in technical interview preparation.
Create personalized, actionable 7-day study plans based on performance data.
Be specific, motivating, and practical. Focus on progressive improvement.`,
        prompt: `Create a personalized 7-day study plan for this software engineer:

PERFORMANCE DATA:
- Total sessions completed: ${totalSessions}
- Overall average score: ${overallAvg}/100

CATEGORY BREAKDOWN:
${
  categoryAverages.length > 0
    ? categoryAverages
        .map((c) => `- ${c.category}: ${c.avgScore}/100 avg (${c.sessionCount} sessions)`)
        .join('\n')
    : '- No sessions completed yet (beginner plan needed)'
}

Create a balanced plan that:
1. Prioritizes weak areas (score < 70) heavily
2. Maintains strong areas with lighter practice
3. Progressively increases difficulty through the week
4. Gives concrete, actionable daily tips`,
      })

      return {
        ...object,
        overallAvg,
        totalSessions,
        categoryAverages,
        generatedAt: new Date().toISOString(),
      }
    })

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    console.error('[STUDY_PLAN_ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate study plan' },
      { status: 500 }
    )
  }
}
