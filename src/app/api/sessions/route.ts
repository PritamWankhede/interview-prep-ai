import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { CacheKeys } from '@/lib/cache-keys'
import { invalidateCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { answerSchema } from '@/lib/validations/question'

// ─── POST /api/sessions ──────────────────────────────────
// Create a new practice session (submit an answer)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = answerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { questionId, userAnswer, timeTaken } = parsed.data

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId, isActive: true },
      select: { id: true },
    })
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    // Create session
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        questionId,
        userAnswer,
        timeTaken,
        status: 'PENDING',
      },
      include: { question: true },
    })

    // Invalidate user session cache + dashboard stats
    await Promise.all([
      invalidateCache(CacheKeys.userSessions(session.user.id)),
      invalidateCache(CacheKeys.dashboardStats(session.user.id)),
    ])

    return NextResponse.json({ success: true, data: practiceSession }, { status: 201 })
  } catch (error) {
    console.error('[SESSIONS_POST]', error)
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 })
  }
}

// ─── GET /api/sessions ───────────────────────────────────
// Get current user's practice sessions
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))
    const skip = (page - 1) * limit

    const [sessions, total] = await Promise.all([
      prisma.practiceSession.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          question: {
            select: { id: true, title: true, difficulty: true, category: true },
          },
          feedback: {
            select: { overallScore: true, clarity: true, depth: true, accuracy: true },
          },
        },
      }),
      prisma.practiceSession.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
        },
      },
    })
  } catch (error) {
    console.error('[SESSIONS_GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
