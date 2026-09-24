'use client'

import { ArrowRight, BookOpen, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { RecentSessions } from '@/components/dashboard/RecentSessions'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { StudyPlanWidget } from '@/components/dashboard/StudyPlanWidget'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Stats = {
  totalSessions: number
  avgScore: number
  currentStreak: number
  totalEvaluated: number
  scoresByCategory: { category: string; avgScore: number; count: number }[]
  recentSessions: any[]
  weeklyProgress: { date: string; count: number; avgScore: number }[]
}

type Props = { userName: string }

export function DashboardClient({ userName }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data) })
      .finally(() => setLoading(false))
  }, [])

  const firstName = userName?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {loading
              ? 'Loading your progress...'
              : stats?.totalSessions === 0
              ? "Ready to start? Pick your first question below."
              : `You've completed ${stats?.totalSessions} sessions. Keep the momentum going!`}
          </p>
        </div>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          Practice now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats cards */}
      <StatsCards
        totalSessions={stats?.totalSessions ?? 0}
        avgScore={stats?.avgScore ?? 0}
        currentStreak={stats?.currentStreak ?? 0}
        totalEvaluated={stats?.totalEvaluated ?? 0}
        loading={loading}
      />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — charts + sessions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Weekly activity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Weekly Activity</h2>
              </div>
              <p className="text-xs text-muted-foreground">Sessions and average scores over the last 7 days</p>
            </CardHeader>
            <CardContent>
              <WeeklyChart data={stats?.weeklyProgress ?? []} loading={loading} />
            </CardContent>
          </Card>

          {/* Category performance */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Performance by Category</h2>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.scoresByCategory && stats.scoresByCategory.length > 0 ? (
                <div className="space-y-3">
                  {stats.scoresByCategory
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .map(({ category, avgScore, count }) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{count} sessions</span>
                            <span className={`font-bold ${
                              avgScore >= 75 ? 'text-emerald-600' :
                              avgScore >= 50 ? 'text-amber-600' : 'text-red-500'
                            }`}>{avgScore}/100</span>
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              avgScore >= 75 ? 'bg-emerald-500' :
                              avgScore >= 50 ? 'bg-amber-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Complete some sessions to see your category performance
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent sessions */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="font-semibold">Recent Sessions</h2>
            </CardHeader>
            <CardContent>
              <RecentSessions sessions={stats?.recentSessions ?? []} loading={loading} />
            </CardContent>
          </Card>
        </div>

        {/* Right column — AI Study Plan */}
        <div className="space-y-6">
          <StudyPlanWidget />

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="font-semibold text-sm">Quick Practice</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Easy warm-up', href: '/practice?difficulty=EASY', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' },
                { label: 'System Design', href: '/practice?category=SYSTEM_DESIGN', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
                { label: 'Behavioral', href: '/practice?category=BEHAVIORAL', color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400' },
                { label: 'Hard challenge', href: '/practice?difficulty=HARD', color: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' },
              ].map(({ label, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${color}`}
                >
                  {label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
