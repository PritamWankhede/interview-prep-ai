'use client'

import { useState } from 'react'

import { AnswerEditor } from '@/components/practice/AnswerEditor'
import { FeedbackPanel } from '@/components/practice/FeedbackPanel'

type Question = {
  id: string
  hints: string[]
}

export function PracticeQuestionClient({ question }: { question: Question }) {
  const [sessionId, setSessionId] = useState<string | null>(null)

  if (sessionId) {
    return <FeedbackPanel sessionId={sessionId} />
  }

  return (
    <AnswerEditor
      questionId={question.id}
      hints={question.hints}
      onSubmitSuccess={setSessionId}
    />
  )
}
