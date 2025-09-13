import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    if (existingRequest?.status === 'PENDING') {
      return NextResponse.json(
        { error: 'Verification request already pending' },
        { status: 409 }
      )
    }

    if (existingRequest?.status === 'APPROVED') {
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

    // Convert File -> Buffer -> Base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "verification_uploads", resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error)
          resolve(result as { secure_url: string })
        }
      )
      uploadStream.end(buffer)
    })

    // Create or update verification request
    const verificationRequest = await prisma.verificationRequest.upsert({
      where: { userId: user.id },
      update: {
        idImageUrl: uploadResult.secure_url,
        status: 'PENDING',
        note: null,
        adminId: null,
      },
      create: {
        userId: user.id,
        idImageUrl: uploadResult.secure_url,
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