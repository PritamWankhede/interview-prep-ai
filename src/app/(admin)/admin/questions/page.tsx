import type { Metadata } from 'next'

import { AdminQuestionsClient } from '@/components/admin/AdminQuestionsClient'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Admin — Questions' }

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      difficulty: true,
      category: true,
      targetRole: true,
      isActive: true,
      createdAt: true,
      tags: true,
      hints: true,
      description: true,
      updatedAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {questions.length} total questions
          </p>
        </div>
      </div>
      <AdminQuestionsClient questions={questions} />
    </div>
  )
}
