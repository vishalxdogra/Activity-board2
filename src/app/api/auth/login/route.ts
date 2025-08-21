import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { rollNumber, password } = validationResult.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { rollNumber },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        email: true,
        passwordHash: true,
        isVerified: true,
        isAdmin: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      rollNumber: user.rollNumber,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    })

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        rollNumber: user.rollNumber,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
