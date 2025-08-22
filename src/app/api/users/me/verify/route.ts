import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a pending or approved verification request
    const existingRequest = await prisma.verificationRequest.findUnique({
      where: { userId: user.id },
    })

    if (existingRequest && existingRequest.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Verification request already pending' },
        { status: 409 }
      )
    }

    if (existingRequest && existingRequest.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 409 }
      )
    }

    // Instead of uploading a file, just create or update a record with timestamp
    const verificationRequest = await prisma.verificationRequest.upsert({
      where: { userId: user.id },
      update: {
        idImageUrl: null, // no upload
        status: 'PENDING',
        note: 'Verification requested',
        adminId: null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        idImageUrl: null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      verificationRequest: {
        id: verificationRequest.id,
        status: verificationRequest.status,
        createdAt: verificationRequest.createdAt,
      },
    })

  } catch (error) {
    console.error('Verification request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
