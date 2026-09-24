import { Category, Difficulty, TargetRole } from '@prisma/client'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { QuestionCard } from '@/components/practice/QuestionCard'
import { QuestionFilters } from '@/components/practice/QuestionFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Practice' }

type SearchParams = {
  category?: Category
  difficulty?: Difficulty
  targetRole?: TargetRole
  search?: string
  page?: string
}

async function QuestionsList({ searchParams }: { searchParams: SearchParams }) {
  const { category, difficulty, targetRole, search, page: pageStr } = searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit

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
        ],
      }),
    }
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])
    return { questions, total, totalPages: Math.ceil(total / limit) }
  })

  if (data.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium">No questions found</p>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{data.questions.length}</span> of{' '}
        <span className="font-medium text-foreground">{data.total}</span> questions
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?${new URLSearchParams({
                ...(category && { category }),
                ...(difficulty && { difficulty }),
                ...(targetRole && { targetRole }),
                ...(search && { search }),
                page: String(p),
              }).toString()}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border hover:bg-accent'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-5 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Questions</h1>
        <p className="text-muted-foreground mt-1">
          Choose a question, write your answer, get AI feedback instantly.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 rounded-lg border bg-card p-4">
            <h2 className="mb-4 font-semibold">Filters</h2>
            <Suspense>
              <QuestionFilters />
            </Suspense>
          </div>
        </aside>

        {/* Question grid */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<QuestionsListSkeleton />}>
            <QuestionsList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
