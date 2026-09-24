import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return NextResponse.json(
      { success: true, message: 'Account created successfully', data: user },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
