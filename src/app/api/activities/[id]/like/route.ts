import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check if user already liked this activity
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId,
        },
      },
    })

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      return NextResponse.json({ 
        message: 'Activity unliked',
        liked: false,
      })
    } else {
      // Like - create new like
      await prisma.like.create({
        data: {
          userId: user.id,
          activityId,
        },
      })

      return NextResponse.json({ 
        message: 'Activity liked',
        liked: true,
      })
    }
  } catch (error) {
    console.error('Like activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
