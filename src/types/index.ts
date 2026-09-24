import { Difficulty, Category, TargetRole, SessionStatus, Role } from '@prisma/client'

// ─── USER ────────────────────────────────────────────────

export type SafeUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: Role
  createdAt: Date
}

// ─── QUESTION ────────────────────────────────────────────

export type Question = {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  category: Category
  targetRole: TargetRole
  tags: string[]
  hints: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── PRACTICE SESSION ────────────────────────────────────

export type PracticeSessionWithDetails = {
  id: string
  userId: string
  questionId: string
  userAnswer: string
  timeTaken: number | null
  status: SessionStatus
  createdAt: Date
  question: Question
  feedback: FeedbackResult | null
}

// ─── AI FEEDBACK ─────────────────────────────────────────

export type FeedbackResult = {
  id: string
  sessionId: string
  overallScore: number
  clarity: number
  depth: number
  accuracy: number
  strengths: string[]
  improvements: string[]
  idealAnswer: string
  createdAt: Date
}

// ─── DASHBOARD STATS ─────────────────────────────────────

export type DashboardStats = {
  totalSessions: number
  avgScore: number
  currentStreak: number
  totalTime: number
  scoresByCategory: { category: Category; avgScore: number }[]
  recentSessions: PracticeSessionWithDetails[]
  weeklyProgress: { date: string; count: number; avgScore: number }[]
}

// ─── API RESPONSE ────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── FILTERS ─────────────────────────────────────────────

export type QuestionFilters = {
  category?: Category
  difficulty?: Difficulty
  targetRole?: TargetRole
  search?: string
  page?: number
  limit?: number
}
