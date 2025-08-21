import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signupSchema } from '@/lib/validation'
import { sanitizeHtml } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { rollNumber, name, password } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { rollNumber },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this roll number already exists' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        rollNumber,
        name: sanitizeHtml(name),
        passwordHash,
      },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        email: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'User created successfully. Upload your ID to get verified.',
      user,
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
