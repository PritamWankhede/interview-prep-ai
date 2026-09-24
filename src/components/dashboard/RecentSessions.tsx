'use client'

import { Category, Difficulty } from '@prisma/client'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type Session = {
  id: string
  createdAt: Date
  question: {
    title: string
    difficulty: Difficulty
    category: Category
  }
  feedback: { overallScore: number } | null
}

type Props = { sessions: Session[]; loading?: boolean }

const difficultyColor: Record<Difficulty, string> = {
  EASY: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  MEDIUM: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  HARD: 'text-red-600 bg-red-50 dark:bg-red-900/20',
}

const scoreColor = (score: number) =>
  score >= 75 ? 'text-emerald-600 font-bold' : score >= 50 ? 'text-amber-600 font-bold' : 'text-red-500 font-bold'

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function RecentSessions({ sessions, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-10 text-center">
        <p className="font-medium text-muted-foreground">No sessions yet</p>
        <Link href="/practice" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          Start practicing <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          {/* Score badge */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            session.feedback
              ? session.feedback.overallScore >= 75
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                : session.feedback.overallScore >= 50
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30'
              : 'bg-muted text-muted-foreground'
          }`}>
            {session.feedback ? session.feedback.overallScore : '—'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {session.question.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${difficultyColor[session.question.difficulty]}`}>
                {session.question.difficulty}
              </span>
              <Badge variant="secondary" className="text-xs py-0 h-4">
                {session.question.category}
              </Badge>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo(session.createdAt)}
              </span>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}

      <Link
        href="/sessions"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        View all sessions <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
