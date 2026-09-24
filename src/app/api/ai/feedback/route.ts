import { createGroq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { CacheKeys, TTL, hashString } from '@/lib/cache-keys'
import { invalidateCache, withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { rateLimiters } from '@/lib/rate-limit'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! })

// Structured output schema for AI feedback
const feedbackSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall score 0-100'),
  clarity: z.number().min(0).max(100).describe('Clarity and communication score 0-100'),
  depth: z.number().min(0).max(100).describe('Depth and completeness score 0-100'),
  accuracy: z.number().min(0).max(100).describe('Technical accuracy score 0-100'),
  strengths: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('2-4 specific strengths of the answer'),
  improvements: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('2-4 specific areas for improvement with actionable advice'),
  idealAnswer: z
    .string()
    .describe('REQUIRED: A comprehensive model answer between 150 and 300 words. You MUST always include this field.'),
})

// ─── POST /api/ai/feedback ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit — 5 AI calls per minute per user
    const rl = await rateLimiters.aiFeedback(session.user.id)
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: `Rate limit exceeded. Try again in ${Math.ceil(rl.reset - Date.now() / 1000)}s` },
        { status: 429, headers: { 'X-RateLimit-Remaining': String(rl.remaining) } }
      )
    }

    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 })
    }

    // Fetch the practice session
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId, userId: session.user.id },
      include: { question: true, feedback: true },
    })

    if (!practiceSession) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
    }

    // Return cached DB feedback if already evaluated
    if (practiceSession.feedback) {
      return NextResponse.json({ success: true, data: practiceSession.feedback })
    }

    // Check Redis cache (by question + answer hash)
    const answerHash = hashString(practiceSession.userAnswer.slice(0, 500))
    const feedbackCacheKey = CacheKeys.aiFeedback(practiceSession.questionId, answerHash)

    const aiResult = await withCache(feedbackCacheKey, TTL.FEEDBACK, async () => {
      // Use generateObject for structured, reliable output
      const { object } = await generateObject({
        model: groq('openai/gpt-oss-20b'),
        schema: feedbackSchema,
        system: `You are an expert technical interviewer with 15+ years of experience 
evaluating software engineers at top tech companies (Google, Meta, Amazon).

IMPORTANT: You MUST return ALL of these fields in your JSON response:
- overallScore (number 0-100)
- clarity (number 0-100)
- depth (number 0-100)
- accuracy (number 0-100)
- strengths (array of 2-4 strings)
- improvements (array of 2-4 strings)
- idealAnswer (string, 150-300 words — this field is REQUIRED, never omit it)

Score dimensions independently:
- Clarity (0-100): Communication, structure, readability
- Depth (0-100): Completeness, detail level, edge cases covered  
- Accuracy (0-100): Technical correctness, no misconceptions
- Overall (0-100): Weighted average with accuracy weighted highest`,

        prompt: `Evaluate this technical interview answer. You MUST include all 7 fields in your response including idealAnswer.

QUESTION: ${practiceSession.question.title}
CONTEXT: ${practiceSession.question.description}
CATEGORY: ${practiceSession.question.category}
DIFFICULTY: ${practiceSession.question.difficulty}

CANDIDATE'S ANSWER:
---
${practiceSession.userAnswer}
---

Return JSON with exactly these fields: overallScore, clarity, depth, accuracy, strengths, improvements, idealAnswer.
The idealAnswer field is mandatory - write a 150-300 word model answer for this question.`,
      })

      return object
    })

    // Persist feedback to DB (upsert handles retries gracefully)
    const feedback = await prisma.feedback.upsert({
      where: { sessionId: practiceSession.id },
      create: {
        sessionId: practiceSession.id,
        overallScore: aiResult.overallScore,
        clarity: aiResult.clarity,
        depth: aiResult.depth,
        accuracy: aiResult.accuracy,
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
        idealAnswer: aiResult.idealAnswer || 'A strong answer covers the core concepts with specific examples, explains trade-offs, and demonstrates practical understanding of the topic.',
        rawAiResponse: { model: 'openai/gpt-oss-20b', cached: false },
      },
      update: {
        overallScore: aiResult.overallScore,
        clarity: aiResult.clarity,
        depth: aiResult.depth,
        accuracy: aiResult.accuracy,
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
        idealAnswer: aiResult.idealAnswer || 'A strong answer covers the core concepts with specific examples, explains trade-offs, and demonstrates practical understanding of the topic.',
        rawAiResponse: { model: 'openai/gpt-oss-20b', cached: false },
      },
    })

    // Update session status
    await prisma.practiceSession.update({
      where: { id: practiceSession.id },
      data: { status: 'EVALUATED' },
    })

    // Update daily progress
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await prisma.userProgress.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      create: {
        userId: session.user.id,
        date: today,
        questionsCount: 1,
        avgScore: feedback.overallScore,
        streak: 1,
        totalTime: practiceSession.timeTaken ?? 0,
      },
      update: {
        questionsCount: { increment: 1 },
        totalTime: { increment: practiceSession.timeTaken ?? 0 },
      },
    })

    // Invalidate dashboard stats cache
    await invalidateCache(CacheKeys.dashboardStats(session.user.id))

    return NextResponse.json({ success: true, data: feedback })
  } catch (error) {
    console.error('[AI_FEEDBACK_ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'AI evaluation failed. Please try again.' },
      { status: 500 }
    )
  }
}
