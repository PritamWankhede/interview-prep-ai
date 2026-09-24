import { Brain, Home, Search } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      {/* Big 404 */}
      <div className="relative">
        <p className="text-[120px] font-black leading-none text-muted/30 select-none sm:text-[180px]">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Search className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button className="gap-2 w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Go to dashboard
          </Button>
        </Link>
        <Link href="/practice">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Brain className="h-4 w-4" />
            Browse questions
          </Button>
        </Link>
      </div>
    </div>
  )
}
