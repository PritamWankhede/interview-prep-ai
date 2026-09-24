import { redis } from '@/lib/redis'

/**
 * Generic cache wrapper.
 * Checks Redis first — on miss, runs fetchFn, stores result, returns it.
 *
 * @param key    - Redis cache key
 * @param ttl    - Time to live in seconds
 * @param fetchFn - Async function that fetches fresh data on cache miss
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    // Check cache
    const cached = await redis.get<T>(key)
    if (cached !== null && cached !== undefined) {
      return cached
    }
  } catch (err) {
    // Redis failure should never break the app — fall through to DB
    console.warn('[CACHE_GET_ERROR]', key, err)
  }

  // Cache miss — fetch fresh data
  const fresh = await fetchFn()

  try {
    // Store in Redis with TTL (ex = seconds)
    await redis.set(key, fresh, { ex: ttl })
  } catch (err) {
    console.warn('[CACHE_SET_ERROR]', key, err)
  }

  return fresh
}

/**
 * Invalidate one or more cache keys.
 * Call this after mutations (POST, PUT, DELETE).
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return
  try {
    await redis.del(...keys)
  } catch (err) {
    console.warn('[CACHE_INVALIDATE_ERROR]', keys, err)
  }
}

/**
 * Invalidate all keys matching a pattern.
 * Use sparingly — scans the entire keyspace.
 * Example: invalidateCachePattern('questions:*')
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    let cursor = '0'
    do {
      const [nextCursor, keys] = await redis.scan(parseInt(cursor), {
        match: pattern,
        count: 100,
      })
      cursor = String(nextCursor)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } while (cursor !== '0')
  } catch (err) {
    console.warn('[CACHE_PATTERN_INVALIDATE_ERROR]', pattern, err)
  }
}
