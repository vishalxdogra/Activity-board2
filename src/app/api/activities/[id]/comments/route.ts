import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { commentSchema } from '@/lib/validation'
import { sanitizeHtml } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = params.id

    const comments = await prisma.comment.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validationResult = commentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { text } = validationResult.data

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        activityId,
        text: sanitizeHtml(text),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
