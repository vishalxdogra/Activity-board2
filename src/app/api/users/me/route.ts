import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeHtml } from '@/lib/utils'

// Get logged-in user with verification request
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userWithVerification = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        email: true,
        profilePicUrl: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
        verificationRequest: {
          select: {
            status: true,
            createdAt: true,
            note: true,
          },
        },
      },
    })

    return NextResponse.json({ user: userWithVerification })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update profile (name/email/profilePicUrl only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, profilePicUrl } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name: sanitizeHtml(name) }),
        ...(email && { email: sanitizeHtml(email) }),
        ...(profilePicUrl && { profilePicUrl: sanitizeHtml(profilePicUrl) }),
      },
      select: {
        id: true,
        rollNumber: true,
        name: true,
        email: true,
        profilePicUrl: true,
        isVerified: true,
        isAdmin: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create verification request (no file upload)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If already verified, block request
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isVerified: true, verificationRequest: true },
    })

    if (existingUser?.isVerified) {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 })
    }

    if (existingUser?.verificationRequest && existingUser.verificationRequest.status === 'PENDING') {
      return NextResponse.json({ error: 'Verification request already pending' }, { status: 400 })
    }

    // Create verification request without upload
    await prisma.verificationRequest.upsert({
      where: { userId: user.id },
      update: { status: 'PENDING', note: null },
      create: {
        userId: user.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ message: 'Verification request submitted' })
  } catch (error) {
    console.error('Verification request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
