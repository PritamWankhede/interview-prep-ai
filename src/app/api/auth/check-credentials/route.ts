import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'
import { rateLimiters } from '@/lib/rate-limit'

// ─── POST /api/auth/check-credentials ───────────────────
// Validates email/password BEFORE NextAuth session creation.
// Returns 200 if valid, 401 if invalid. Never leaks which field is wrong.
export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP — 10 attempts per 15 minutes
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rl = await rateLimiters.auth(ip)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rl.remaining),
            'Retry-After': String(Math.ceil(rl.reset - Date.now() / 1000)),
          },
        }
      )
    }

    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { email, password } = parsed.data

    // Find user — use consistent timing to prevent timing attacks
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // Always run bcrypt even if user not found (prevents timing attacks)
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding'
    const hashToCompare = user?.password ?? dummyHash

    const isValid = await bcrypt.compare(password, hashToCompare)

    if (!user || !user.password || !isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[CHECK_CREDENTIALS_ERROR]', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
