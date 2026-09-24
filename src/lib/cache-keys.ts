/**
 * Centralized cache key factory.
 * All Redis keys go through here — prevents typos and key collisions.
 *
 * TTL constants (in seconds):
 *   QUESTIONS_TTL  - 1 hour   (questions change rarely)
 *   STATS_TTL      - 5 min    (dashboard stats, semi-fresh)
 *   FEEDBACK_TTL   - 24 hours (AI feedback, expensive to regenerate)
 *   SESSION_TTL    - 30 min   (user session cache)
 */

export const TTL = {
  QUESTIONS: 60 * 60,        // 1 hour
  STATS: 60 * 5,             // 5 minutes
  FEEDBACK: 60 * 60 * 24,    // 24 hours
  SESSION: 60 * 30,          // 30 minutes
  STUDY_PLAN: 60 * 60 * 6,   // 6 hours
} as const

export const CacheKeys = {
  // ─── Questions ───────────────────────────────────────
  /** All active questions (no filter) */
  allQuestions: () => 'questions:all',

  /** Questions filtered by category */
  questionsByCategory: (category: string) => `questions:category:${category}`,

  /** Questions filtered by role */
  questionsByRole: (role: string) => `questions:role:${role}`,

  /** Questions filtered by difficulty */
  questionsByDifficulty: (difficulty: string) => `questions:difficulty:${difficulty}`,

  /** Single question by ID */
  question: (id: string) => `questions:${id}`,

  // ─── Dashboard Stats ─────────────────────────────────
  /** User dashboard stats */
  dashboardStats: (userId: string) => `stats:dashboard:${userId}`,

  /** User weekly progress */
  weeklyProgress: (userId: string) => `stats:weekly:${userId}`,

  // ─── AI Feedback ─────────────────────────────────────
  /**
   * AI feedback cache key.
   * Keyed by questionId + a hash of the answer
   * so similar answers to the same question reuse the cache.
   */
  aiFeedback: (questionId: string, answerHash: string) =>
    `ai:feedback:${questionId}:${answerHash}`,

  /** Study plan for a user */
  studyPlan: (userId: string) => `ai:studyplan:${userId}`,

  // ─── User ────────────────────────────────────────────
  /** User profile data */
  userProfile: (userId: string) => `user:profile:${userId}`,

  /** User's practice sessions list */
  userSessions: (userId: string) => `user:sessions:${userId}`,
} as const

/**
 * Simple string hash for cache key generation.
 * Used to create consistent keys for AI feedback based on answer content.
 */
export function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}
