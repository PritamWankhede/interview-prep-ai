'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL_ERROR]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-2xl bg-destructive/10 p-5">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-sm text-muted-foreground text-sm">
          An unexpected error occurred. We&apos;ve logged it and will look into it.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
          Go to dashboard
        </Button>
      </div>
    </div>
  )
}
