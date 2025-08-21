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

    // Check if activity exists and get capacity info
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { 
        id: true, 
        capacity: true,
        _count: {
          select: {
            joinRequests: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Check if user already has a join request
    const existingJoinRequest = await prisma.joinRequest.findUnique({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId,
        },
      },
    })

    if (existingJoinRequest) {
      return NextResponse.json(
        { error: 'You have already requested to join this activity' },
        { status: 409 }
      )
    }

    // Check capacity
    if (activity.capacity && activity._count.joinRequests >= activity.capacity) {
      return NextResponse.json(
        { error: 'Activity is at full capacity' },
        { status: 409 }
      )
    }

    // Create join request (auto-confirm for open events)
    const joinRequest = await prisma.joinRequest.create({
      data: {
        userId: user.id,
        activityId,
        status: 'CONFIRMED', // Auto-confirm for MVP
      },
    })

    // Update joined count
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        joinedCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ 
      message: 'Successfully joined activity',
      joinRequest,
    })
  } catch (error) {
    console.error('Join activity error:', error)
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

    const activityId = params.id

    const joinRequest = await prisma.joinRequest.findUnique({
      where: {
        userId_activityId: {
          userId: user.id,
          activityId,
        },
      },
    })

    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 })
    }

    // Delete join request
    await prisma.joinRequest.delete({
      where: { id: joinRequest.id },
    })

    // Update joined count if it was confirmed
    if (joinRequest.status === 'CONFIRMED') {
      await prisma.activity.update({
        where: { id: activityId },
        data: {
          joinedCount: {
            decrement: 1,
          },
        },
      })
    }

    return NextResponse.json({ message: 'Successfully left activity' })
  } catch (error) {
    console.error('Leave activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
