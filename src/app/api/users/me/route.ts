import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeHtml } from '@/lib/utils'

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
