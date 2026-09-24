'use client'

import { Brain, Flame, Star, Trophy, TrendingUp, Zap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  totalSessions: number
  avgScore: number
  currentStreak: number
  totalEvaluated: number
  loading?: boolean
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
  loading?: boolean
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
      {/* Subtle gradient accent */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full opacity-60 ${color}`} />
    </Card>
  )
}

export function StatsCards({ totalSessions, avgScore, currentStreak, totalEvaluated, loading }: Props) {
  const scoreColor =
    avgScore >= 75 ? 'bg-emerald-500' : avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Brain}
        label="Total Sessions"
        value={totalSessions}
        sub={`${totalEvaluated} evaluated`}
        color="bg-violet-500"
        loading={loading}
      />
      <StatCard
        icon={Trophy}
        label="Avg Score"
        value={loading ? '—' : `${avgScore}/100`}
        sub={avgScore >= 75 ? 'Excellent' : avgScore >= 50 ? 'Good' : 'Keep going'}
        color={loading ? 'bg-slate-400' : scoreColor}
        loading={loading}
      />
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={loading ? '—' : `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`}
        sub={currentStreak >= 7 ? '🔥 On fire!' : currentStreak > 0 ? 'Keep it up!' : 'Start today'}
        color={currentStreak >= 3 ? 'bg-orange-500' : 'bg-slate-400'}
        loading={loading}
      />
      <StatCard
        icon={Zap}
        label="AI Feedback"
        value={loading ? '—' : totalEvaluated}
        sub="answers evaluated"
        color="bg-blue-500"
        loading={loading}
      />
    </div>
  )
}
