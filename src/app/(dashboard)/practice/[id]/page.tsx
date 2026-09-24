import { Category, Difficulty, TargetRole } from '@prisma/client'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PracticeQuestionClient } from '@/components/practice/PracticeQuestionClient'
import { Badge } from '@/components/ui/badge'
import { CacheKeys, TTL } from '@/lib/cache-keys'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

const difficultyColor: Record<Difficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

const categoryLabel: Record<Category, string> = {
  DSA: 'DSA',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const question = await withCache(CacheKeys.question(id), TTL.QUESTIONS, () =>
    prisma.question.findUnique({ where: { id, isActive: true } })
  )
  return { title: question?.title ?? 'Practice Question' }
}

export default async function PracticeQuestionPage({ params }: Props) {
  const { id } = await params

  const question = await withCache(CacheKeys.question(id), TTL.QUESTIONS, () =>
    prisma.question.findUnique({ where: { id, isActive: true } })
  )

  if (!question) notFound()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor[question.difficulty]}`}
          >
            {question.difficulty}
          </span>
          <Badge variant="secondary">{categoryLabel[question.category]}</Badge>
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{question.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{question.description}</p>
      </div>

      {/* Answer editor + feedback — client component */}
      <PracticeQuestionClient question={question} />
    </div>
  )
}
