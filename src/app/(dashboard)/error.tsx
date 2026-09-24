'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DASHBOARD_ERROR]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="rounded-2xl bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Failed to load</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Something went wrong loading this page. Your data is safe.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} size="sm" className="gap-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </Button>
        <Button variant="outline" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
