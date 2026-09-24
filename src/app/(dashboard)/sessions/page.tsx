import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Category, Difficulty } from '@prisma/client'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Practice History' }

const difficultyColor: Record<Difficulty, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
}

const categoryLabel: Record<Category, string> = {
  DSA: 'DSA', SYSTEM_DESIGN: 'System Design', BEHAVIORAL: 'Behavioral',
  FRONTEND: 'Frontend', BACKEND: 'Backend', DATABASE: 'Database',
}

export default async function SessionsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      question: { select: { title: true, difficulty: true, category: true } },
      feedback: { select: { overallScore: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice History</h1>
        <p className="text-muted-foreground mt-1">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} completed
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          <p className="font-medium">No sessions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            <Link href="/practice" className="text-primary hover:underline">
              Start practicing
            </Link>{' '}
            to see your history here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Question</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Difficulty</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {s.question.title}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabel[s.question.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor[s.question.difficulty]}`}>
                      {s.question.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.feedback ? (
                      <span className={`font-bold ${s.feedback.overallScore >= 75 ? 'text-emerald-600' : s.feedback.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {s.feedback.overallScore}/100
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">{s.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
