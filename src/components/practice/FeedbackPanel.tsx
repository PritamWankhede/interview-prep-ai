'use client'

import { CheckCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

type Feedback = {
  overallScore: number
  clarity: number
  depth: number
  accuracy: number
  strengths: string[]
  improvements: string[]
  idealAnswer: string
}

type Props = { sessionId: string }

const loadingSteps = [
  'Analyzing your answer structure...',
  'Checking technical accuracy...',
  'Scoring across dimensions...',
  'Generating personalized feedback...',
]

export function FeedbackPanel({ sessionId }: Props) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cycle through loading steps for better UX
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 2500)

    const getFeedback = async () => {
      try {
        const res = await fetch('/api/ai/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error ?? 'Failed to get feedback')
          return
        }
        setFeedback(json.data)
      } catch {
        setError('Failed to connect to AI service')
      } finally {
        setLoading(false)
        clearInterval(interval)
      }
    }

    getFeedback()
    return () => clearInterval(interval)
  }, [sessionId])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Animated loading state */}
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">AI Interview Coach is evaluating...</p>
              <p className="text-xs text-muted-foreground mt-0.5 transition-all">
                {loadingSteps[loadingStep]}
              </p>
            </div>
          </div>
          {/* Step indicators */}
          <div className="flex gap-1.5">
            {loadingSteps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i <= loadingStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {['Clarity', 'Depth', 'Accuracy'].map((label) => (
            <Card key={label}>
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center space-y-3">
        <XCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="font-medium text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">Your answer was saved.</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    )
  }

  if (!feedback) return null

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'

  const scoreLabel = (score: number) =>
    score >= 75 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work'

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="rounded-xl border bg-card p-6 text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          AI Score
        </p>
        <p className={`text-6xl font-bold ${scoreColor(feedback.overallScore)}`}>
          {feedback.overallScore}
          <span className="text-2xl text-muted-foreground font-normal">/100</span>
        </p>
        <p className={`text-sm font-medium ${scoreColor(feedback.overallScore)}`}>
          {scoreLabel(feedback.overallScore)}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Clarity', score: feedback.clarity },
          { label: 'Depth', score: feedback.depth },
          { label: 'Accuracy', score: feedback.accuracy },
        ].map(({ label, score }) => (
          <Card key={label}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className={`font-bold ${scoreColor(score)}`}>{score}</span>
              </div>
              <Progress value={score} className="h-2" />
              <p className={`text-xs ${scoreColor(score)}`}>{scoreLabel(score)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strengths */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-3">
          <h3 className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            What you did well
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Improvements */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <h3 className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
            <XCircle className="h-4 w-4" />
            Areas to improve
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Ideal answer */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Ideal Answer</h3>
          <p className="text-xs text-muted-foreground">
            A model answer generated by your AI coach
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {feedback.idealAnswer}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/practice"
          className="flex-1 rounded-lg border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
        >
          Practice another question
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View my dashboard
        </Link>
      </div>
    </div>
  )
}
