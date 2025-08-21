import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  rollNumber: string
  name: string
  email?: string | null
  isVerified: boolean
  isAdmin: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      rollNumber: user.rollNumber,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  const user = verifyToken(token)
  if (!user) return null

  // Verify user still exists and get fresh data
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      rollNumber: true,
      name: true,
      email: true,
      isVerified: true,
      isAdmin: true,
    },
  })

  return dbUser
}

export function validateRollNumber(rollNumber: string): boolean {
  // Roll number format: CS2023/014, AR2023/056, etc.
  const rollNumberRegex = /^[A-Z]{2}\d{4}\/\d{3}$/
  return rollNumberRegex.test(rollNumber)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}
