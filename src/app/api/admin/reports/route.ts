import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      where: { status: 'OPEN' },
      include: {
        reporter: {
          select: {
            id: true,
            rollNumber: true,
            name: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            author: {
              select: {
                rollNumber: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
