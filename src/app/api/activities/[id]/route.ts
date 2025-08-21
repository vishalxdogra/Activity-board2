import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            joinRequests: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const activityWithCounts = {
      ...activity,
      likeCount: activity._count.likes,
      commentCount: activity._count.comments,
      joinedCount: activity._count.joinRequests,
    }

    return NextResponse.json({ activity: activityWithCounts })
  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, location, startDate, endDate, capacity } = body

    const updatedActivity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location !== undefined && { location }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(capacity !== undefined && { capacity }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json({ activity: updatedActivity })
  } catch (error) {
    console.error('Update activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (activity.authorId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.activity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Activity deleted successfully' })
  } catch (error) {
    console.error('Delete activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
