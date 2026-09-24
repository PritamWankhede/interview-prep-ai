'use client'

import { Category, Difficulty, TargetRole } from '@prisma/client'
import { ArrowRight, BarChart2, Tag } from 'lucide-react'
import Link from 'next/link'

const difficultyConfig: Record<Difficulty, { label: string; classes: string; dot: string }> = {
  EASY: {
    label: 'Easy',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  MEDIUM: {
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  HARD: {
    label: 'Hard',
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
}

const categoryLabel: Record<Category, string> = {
  DSA: 'DSA',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
}

const categoryColor: Record<Category, string> = {
  DSA: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  SYSTEM_DESIGN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  BEHAVIORAL: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  FRONTEND: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  BACKEND: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  DATABASE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
}

const roleLabel: Record<TargetRole, string> = {
  FRONTEND_DEV: 'Frontend Dev',
  BACKEND_DEV: 'Backend Dev',
  FULLSTACK_DEV: 'Fullstack Dev',
  DATA_ENGINEER: 'Data Engineer',
  DEVOPS: 'DevOps',
  GENERAL: 'General',
}

type Props = {
  question: {
    id: string
    title: string
    description: string
    difficulty: Difficulty
    category: Category
    targetRole: TargetRole
    tags: string[]
  }
}

export function QuestionCard({ question }: Props) {
  const diff = difficultyConfig[question.difficulty]

  return (
    <Link
      href={`/practice/${question.id}`}
      className="group relative flex flex-col rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Practice: ${question.title}`}
    >
      {/* Top row — badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${diff.classes}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
          {diff.label}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor[question.category]}`}>
          {categoryLabel[question.category]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground leading-snug line-clamp-2 flex-1 mb-2 group-hover:text-primary transition-colors">
        {question.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
        {question.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {question.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {question.tags.length > 2 && (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              +{question.tags.length - 2}
            </span>
          )}
        </div>

        {/* Arrow */}
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5">
          Practice
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Subtle top accent on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}
