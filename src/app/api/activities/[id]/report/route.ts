import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportSchema } from '@/lib/validation'
import { sanitizeHtml } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = params.id
    const body = await request.json()

    // Validate input
    const validationResult = reportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { reason } = validationResult.data

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check if user already reported this activity
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        activityId,
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this activity' },
        { status: 409 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        activityId,
        reason: sanitizeHtml(reason),
      },
    })

    return NextResponse.json({ 
      message: 'Report submitted successfully',
      report: {
        id: report.id,
        createdAt: report.createdAt,
      },
    })
  } catch (error) {
    console.error('Report activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
