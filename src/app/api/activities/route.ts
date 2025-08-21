import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { openActivitySchema, communityActivitySchema, fundedActivitySchema } from '@/lib/validation'
import { sanitizeHtml } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const genre = searchParams.get('genre')
    const type = searchParams.get('type')
    const frequency = searchParams.get('frequency')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (genre && genre !== 'ALL') {
      where.genre = genre
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    if (frequency && frequency !== 'ALL') {
      where.frequency = frequency
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'likes') {
      orderBy = { likes: { _count: 'desc' } }
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
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

    // Add computed fields
    const activitiesWithCounts = activities.map(activity => ({
      ...activity,
      likeCount: activity._count.likes,
      commentCount: activity._count.comments,
      joinedCount: activity._count.joinRequests,
    }))

    return NextResponse.json({ activities: activitiesWithCounts })
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Only verified users can create activities' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate based on activity type
    let validationResult
    switch (body.type) {
      case 'OPEN':
        validationResult = openActivitySchema.safeParse(body)
        break
      case 'COMMUNITY':
        validationResult = communityActivitySchema.safeParse(body)
        break
      case 'COLLEGE_FUNDED':
        validationResult = fundedActivitySchema.safeParse(body)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 }
        )
    }

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.errors)
      console.error('Request body:', body)
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check user's active activity limit (max 5)
    const activeActivitiesCount = await prisma.activity.count({
      where: {
        authorId: user.id,
        isActive: true,
      },
    })

    if (activeActivitiesCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 active activities allowed per user' },
        { status: 429 }
      )
    }

    // Prepare activity data
    const activityData: any = {
      authorId: user.id,
      title: sanitizeHtml(data.title),
      description: sanitizeHtml(data.description),
      type: data.type,
      genre: data.genre,
      location: data.location ? sanitizeHtml(data.location) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      frequency: data.frequency,
      capacity: data.capacity,
    }

    // Handle type-specific data
    if (data.type === 'COLLEGE_FUNDED') {
      activityData.fundingGoal = data.fundingGoal
      activityData.applicationForm = {
        budgetBreakdown: data.budgetBreakdown,
        venueRequirement: sanitizeHtml(data.venueRequirement),
        expectedAttendees: data.expectedAttendees,
        safetyPlan: sanitizeHtml(data.safetyPlan),
        proposedDates: data.proposedDates,
        representativeContact: {
          ...data.representativeContact,
          name: sanitizeHtml(data.representativeContact.name),
        },
      }
      // College funded activities need admin approval
      activityData.isActive = false
    } else if (data.type === 'COMMUNITY') {
      activityData.templatesUsed = {
        communityName: sanitizeHtml(data.communityName),
        goals: sanitizeHtml(data.goals),
        meetingFrequency: data.meetingFrequency,
        firstMeetDate: data.firstMeetDate,
        coOrganisers: data.coOrganisers,
        publicPrivate: data.publicPrivate,
      }
    } else if (data.type === 'OPEN') {
      activityData.templatesUsed = {
        meetingPointDetails: data.meetingPointDetails ? sanitizeHtml(data.meetingPointDetails) : null,
        expectedDurationMinutes: data.expectedDurationMinutes,
      }
    }

    const activity = await prisma.activity.create({
      data: activityData,
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

    const message = data.type === 'COLLEGE_FUNDED' 
      ? 'Created. Funding activities are pending admin approval.'
      : 'Activity created successfully'

    return NextResponse.json({
      message,
      activity,
    }, { status: 201 })

  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
