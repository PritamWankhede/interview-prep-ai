'use client'

import { BookOpen, ChevronRight, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type DayPlan = {
  day: number
  focus: string
  goal: string
  suggestedQuestionCount: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tip: string
}

type StudyPlan = {
  overallAssessment: string
  weakAreas: string[]
  strongAreas: string[]
  days: DayPlan[]
  immediate: string[]
  thisWeek: string[]
  overallAvg: number
  totalSessions: number
  generatedAt: string
}

const difficultyColor = {
  EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function StudyPlanWidget() {
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const todayDay = new Date().getDay() === 0 ? 7 : new Date().getDay()

  useEffect(() => {
    fetchPlan()
  }, [])

  const fetchPlan = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/study-plan')
      const json = await res.json()
      if (json.success) setPlan(json.data)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-semibold text-sm">AI is generating your study plan...</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !plan) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Could not load study plan</p>
          <button onClick={fetchPlan} className="flex items-center gap-1.5 mx-auto text-xs text-primary hover:underline">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  const todayPlan = plan.days.find((d) => d.day === (todayDay <= 7 ? todayDay : 1)) ?? plan.days[0]

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Study Plan</h3>
              <p className="text-xs text-muted-foreground">Personalized 7-day roadmap</p>
            </div>
          </div>
          <button
            onClick={fetchPlan}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh study plan"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assessment */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {plan.overallAssessment}
        </p>

        {/* Today's focus */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Today — {dayNames[todayDay]}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[todayPlan.difficulty]}`}>
              {todayPlan.difficulty}
            </span>
          </div>
          <p className="font-semibold text-sm">{todayPlan.focus}</p>
          <p className="text-xs text-muted-foreground">{todayPlan.goal}</p>
          <div className="flex items-center gap-2 pt-1">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">
              {todayPlan.suggestedQuestionCount} questions suggested
            </span>
          </div>
          <div className="rounded-lg bg-background/60 p-2.5 text-xs text-muted-foreground italic">
            💡 {todayPlan.tip}
          </div>
        </div>

        {/* Immediate actions */}
        {plan.immediate.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Focus on now
            </p>
            {plan.immediate.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </div>
            ))}
          </div>
        )}

        {/* 7-day mini view */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline w-full"
        >
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {expanded ? 'Hide' : 'View'} full 7-day plan
        </button>

        {expanded && (
          <div className="space-y-2 pt-1">
            {plan.days.map((day) => (
              <div
                key={day.day}
                className={`flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors ${
                  day.day === todayDay
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className={`shrink-0 text-xs font-bold w-7 text-center rounded-md py-1 ${
                  day.day === todayDay ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {dayNames[day.day]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{day.focus}</p>
                  <p className="text-xs text-muted-foreground truncate">{day.goal}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium ${difficultyColor[day.difficulty]}`}>
                  {day.difficulty[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/practice"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          Start today's practice
        </Link>
      </CardContent>
    </Card>
  )
}
