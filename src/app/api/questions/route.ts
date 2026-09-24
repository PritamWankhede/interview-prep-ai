import { Category, Difficulty, TargetRole } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { invalidateCachePattern, withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { questionSchema } from '@/lib/validations/question'

// ─── GET /api/questions ──────────────────────────────────
// Public — returns filtered, paginated questions (cached)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category') as Category | null
    const difficulty = searchParams.get('difficulty') as Difficulty | null
    const targetRole = searchParams.get('targetRole') as TargetRole | null
    const search = searchParams.get('search') ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
    const skip = (page - 1) * limit

    // Build cache key from filters
    const filterKey = [
      category ?? 'all',
      difficulty ?? 'all',
      targetRole ?? 'all',
      search || 'nosearch',
      page,
      limit,
    ].join(':')
    const cacheKey = `questions:filtered:${filterKey}`

    const data = await withCache(cacheKey, TTL.QUESTIONS, async () => {
      const where = {
        isActive: true,
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(targetRole && { targetRole }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }),
      }

      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            category: true,
            targetRole: true,
            tags: true,
            hints: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.question.count({ where }),
      ])

      return {
        questions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
        },
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[QUESTIONS_GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// ─── POST /api/questions ─────────────────────────────────
// Admin only — create a new question
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = questionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const question = await prisma.question.create({
      data: { ...parsed.data, createdBy: session.user.id },
    })

    // Invalidate all question caches
    await invalidateCachePattern('questions:*')

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    console.error('[QUESTIONS_POST]', error)
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 })
  }
}
