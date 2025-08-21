import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const verificationRequests = await prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            rollNumber: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ verificationRequests })
  } catch (error) {
    console.error('Get verification requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
