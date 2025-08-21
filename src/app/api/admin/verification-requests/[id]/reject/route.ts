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
    })

    if (!verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }

    if (verificationRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 409 })
    }

    // Update verification request
    await prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminId: user.id,
        note: note || 'Verification rejected',
      },
    })

    return NextResponse.json({ message: 'User verification rejected' })
  } catch (error) {
    console.error('Reject verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
