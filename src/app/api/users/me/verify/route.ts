import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a pending or approved verification request
    const existingRequest = await prisma.verificationRequest.findUnique({
      where: { userId: user.id },
    })

    if (existingRequest && existingRequest.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Verification request already pending' },
        { status: 409 }
      )
    }

    if (existingRequest && existingRequest.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 409 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('idImage') as File

    if (!file) {
      return NextResponse.json({ error: 'ID image is required' }, { status: 400 })
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'verification')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${user.id}_${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create or update verification request
    const verificationRequest = await prisma.verificationRequest.upsert({
      where: { userId: user.id },
      update: {
        idImageUrl: `/uploads/verification/${filename}`,
        status: 'PENDING',
        note: null,
        adminId: null,
      },
      create: {
        userId: user.id,
        idImageUrl: `/uploads/verification/${filename}`,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      verificationRequest: {
        id: verificationRequest.id,
        status: verificationRequest.status,
        createdAt: verificationRequest.createdAt,
      },
    })

  } catch (error) {
    console.error('Verification upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
