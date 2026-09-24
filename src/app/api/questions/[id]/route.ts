import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { invalidateCache, invalidateCachePattern, withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'
import { questionSchema } from '@/lib/validations/question'

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/questions/[id] ─────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const cacheKey = CacheKeys.question(id)

    const question = await withCache(cacheKey, TTL.QUESTIONS, async () => {
      return prisma.question.findUnique({
        where: { id, isActive: true },
      })
    })

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    console.error('[QUESTION_GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch question' }, { status: 500 })
  }
}

// ─── PUT /api/questions/[id] ─────────────────────────────
// Admin only — update a question
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = questionSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const question = await prisma.question.update({
      where: { id },
      data: parsed.data,
    })

    // Invalidate this question + all filtered lists
    await Promise.all([
      invalidateCache(CacheKeys.question(id)),
      invalidateCachePattern('questions:filtered:*'),
    ])

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    console.error('[QUESTION_PUT]', error)
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 })
  }
}

// ─── DELETE /api/questions/[id] ──────────────────────────
// Admin only — soft delete (set isActive = false)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    await prisma.question.update({
      where: { id },
      data: { isActive: false },
    })

    await Promise.all([
      invalidateCache(CacheKeys.question(id)),
      invalidateCachePattern('questions:filtered:*'),
    ])

    return NextResponse.json({ success: true, message: 'Question deactivated' })
  } catch (error) {
    console.error('[QUESTION_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 })
  }
}
