import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const requestId = params.id
    const body = await request.json()
    const { note } = body

    // Find verification request
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    })

    if (!verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }

    if (verificationRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 409 })
    }

    // Update verification request and user in transaction
    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminId: user.id,
          note: note || null,
        },
      }),
      prisma.user.update({
        where: { id: verificationRequest.userId },
        data: { isVerified: true },
      }),
    ])

    return NextResponse.json({ message: 'User verification approved successfully' })
  } catch (error) {
    console.error('Approve verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
