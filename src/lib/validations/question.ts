import { z } from 'zod'
import { Category, Difficulty, TargetRole } from '@prisma/client'

export const questionSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description too long')
    .trim(),
  difficulty: z.nativeEnum(Difficulty),
  category: z.nativeEnum(Category),
  targetRole: z.nativeEnum(TargetRole),
  tags: z.array(z.string().trim()).min(1, 'At least one tag is required').max(10),
  hints: z.array(z.string().trim()).max(5).default([]),
  isActive: z.boolean().default(true),
})

export const answerSchema = z.object({
  questionId: z.string().cuid('Invalid question ID'),
  userAnswer: z
    .string()
    .min(50, 'Answer must be at least 50 characters')
    .max(10000, 'Answer is too long'),
  timeTaken: z.number().int().positive().optional(),
})

export type QuestionInput = z.infer<typeof questionSchema>
export type AnswerInput = z.infer<typeof answerSchema>
