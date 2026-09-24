import { redis } from '@/lib/redis'

export type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp when the window resets
}

/**
 * Sliding-window rate limiter using Redis.
 *
 * @param identifier - Unique key (e.g. userId, IP address)
 * @param limit      - Max requests allowed per window
 * @param windowSecs - Window size in seconds
 *
 * @example
 * const result = await rateLimit(`ai:${userId}`, 5, 60)
 * if (!result.success) return 429
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSecs: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const reset = now + windowSecs

  try {
    // Increment counter
    const count = await redis.incr(key)

    // Set TTL only on first request (so window doesn't reset on every call)
    if (count === 1) {
      await redis.expire(key, windowSecs)
    }

    // Get actual TTL for accurate reset time
    const ttl = await redis.ttl(key)
    const actualReset = now + (ttl > 0 ? ttl : windowSecs)

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: actualReset,
    }
  } catch (err) {
    // Redis failure — fail open (allow request) to avoid blocking users
    console.warn('[RATE_LIMIT_ERROR]', identifier, err)
    return {
      success: true,
      limit,
      remaining: limit,
      reset,
    }
  }
}

/**
 * Preset rate limiters for common use cases.
 */
export const rateLimiters = {
  /** AI feedback: 5 requests per minute per user */
  aiFeedback: (userId: string) => rateLimit(`ai:feedback:${userId}`, 5, 60),

  /** Auth: 10 login attempts per 15 minutes per IP */
  auth: (ip: string) => rateLimit(`auth:${ip}`, 10, 900),

  /** API: 100 requests per minute per user */
  api: (userId: string) => rateLimit(`api:${userId}`, 100, 60),
}
