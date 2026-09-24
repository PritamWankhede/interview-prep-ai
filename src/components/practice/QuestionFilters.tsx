'use client'

import { Category, Difficulty, TargetRole } from '@prisma/client'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const categories: { value: Category; label: string }[] = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DSA', label: 'DSA' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
]

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
]

const roles: { value: TargetRole; label: string }[] = [
  { value: 'FRONTEND_DEV', label: 'Frontend Dev' },
  { value: 'BACKEND_DEV', label: 'Backend Dev' },
  { value: 'FULLSTACK_DEV', label: 'Fullstack Dev' },
  { value: 'GENERAL', label: 'General' },
]

export function QuestionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentCategory = searchParams.get('category')
  const currentDifficulty = searchParams.get('difficulty')
  const currentRole = searchParams.get('targetRole')
  const currentSearch = searchParams.get('search') ?? ''

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page') // reset pagination on filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  const hasFilters = currentCategory || currentDifficulty || currentRole || currentSearch

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          defaultValue={currentSearch}
          className="pl-9"
          onChange={(e) => {
            const val = e.target.value
            const timeout = setTimeout(() => updateParam('search', val || null), 400)
            return () => clearTimeout(timeout)
          }}
          aria-label="Search questions"
        />
      </div>

      {/* Category filter */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() =>
                updateParam('category', currentCategory === c.value ? null : c.value)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentCategory === c.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
              aria-pressed={currentCategory === c.value}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty filter */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Difficulty
        </p>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() =>
                updateParam('difficulty', currentDifficulty === d.value ? null : d.value)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentDifficulty === d.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
              aria-pressed={currentDifficulty === d.value}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role filter */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Target Role
        </p>
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() =>
                updateParam('targetRole', currentRole === r.value ? null : r.value)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                currentRole === r.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
              aria-pressed={currentRole === r.value}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-7 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}

      {isPending && (
        <p className="text-xs text-muted-foreground animate-pulse">Filtering...</p>
      )}
    </div>
  )
}
