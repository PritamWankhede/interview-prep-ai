'use client'

import { Skeleton } from '@/components/ui/skeleton'

type WeekDay = {
  date: string
  count: number
  avgScore: number
}

type Props = {
  data: WeekDay[]
  loading?: boolean
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeeklyChart({ data, loading }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return DAY_LABELS[date.getDay()]
  }

  const getBarColor = (score: number, count: number) => {
    if (count === 0) return 'bg-muted'
    if (score >= 75) return 'bg-emerald-500'
    if (score >= 50) return 'bg-amber-500'
    return 'bg-red-400'
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-24">
          {[60, 80, 40, 90, 55, 70, 45].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-6" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-28">
        {data.map((day, i) => {
          const heightPct = day.count > 0 ? Math.max((day.count / maxCount) * 100, 15) : 8
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 group">
              {/* Tooltip */}
              <div className="relative">
                {day.count > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                    <div className="rounded-md bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap">
                      {day.count} session{day.count !== 1 ? 's' : ''}
                      {day.avgScore > 0 && ` · ${Math.round(day.avgScore)}/100`}
                    </div>
                    <div className="h-1.5 w-1.5 rotate-45 bg-foreground -mt-0.5" />
                  </div>
                )}
              </div>
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${getBarColor(day.avgScore, day.count)}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-2">
        {data.map((day, i) => (
          <div key={i} className="flex-1 text-center text-xs text-muted-foreground">
            {formatDate(day.date)}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥75
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> 50–74
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" /> &lt;50
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground" /> No activity
        </span>
      </div>
    </div>
  )
}
