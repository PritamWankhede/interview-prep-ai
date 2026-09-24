'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Lightbulb, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { answerSchema, type AnswerInput } from '@/lib/validations/question'

type Props = {
  questionId: string
  hints: string[]
  onSubmitSuccess: (sessionId: string) => void
}

export function AnswerEditor({ questionId, hints, onSubmitSuccess }: Props) {
  const [showHints, setShowHints] = useState(false)
  const [startTime] = useState(Date.now())
  const [charCount, setCharCount] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnswerInput>({
    resolver: zodResolver(answerSchema),
    defaultValues: { questionId },
  })

  const answerValue = watch('userAnswer') ?? ''

  const onSubmit = async (data: AnswerInput) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timeTaken }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to submit answer')
        return
      }

      toast.success('Answer submitted! Getting AI feedback...')
      onSubmitSuccess(json.data.id)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Hints */}
      {hints.length > 0 && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="h-4 w-4 text-amber-500" />
            {showHints ? 'Hide hints' : `Show hints (${hints.length})`}
          </button>
          {showHints && (
            <ul className="mt-3 space-y-2">
              {hints.map((hint, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Answer form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register('questionId')} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="answer" className="text-sm font-medium">
              Your Answer
            </label>
            <span
              className={`text-xs ${charCount < 50 ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {charCount} / min 50 chars
            </span>
          </div>
          <Textarea
            id="answer"
            placeholder="Write a thorough answer here. The more detail you provide, the better feedback you'll receive..."
            className="min-h-[280px] resize-y font-mono text-sm leading-relaxed"
            aria-describedby={errors.userAnswer ? 'answer-error' : undefined}
            {...register('userAnswer', {
              onChange: (e) => setCharCount(e.target.value.length),
            })}
          />
          {errors.userAnswer && (
            <p id="answer-error" className="text-sm text-destructive" role="alert">
              {errors.userAnswer.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            AI will evaluate clarity, depth, and accuracy
          </p>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit for feedback'}
          </Button>
        </div>
      </form>
    </div>
  )
}
