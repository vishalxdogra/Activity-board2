import { z } from 'zod'

// Auth validation schemas
export const signupSchema = z.object({
  rollNumber: z.string().regex(/^[A-Z]{2}\d{4}\/\d{3}$/, 'Invalid roll number format (e.g., CS2023/014)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  rollNumber: z.string().regex(/^[A-Z]{2}\d{4}\/\d{3}$/, 'Invalid roll number format'),
  password: z.string().min(1, 'Password is required'),
})

// Activity validation schemas
export const baseActivitySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title too long'),
  description: z.string().min(15, 'Description must be at least 15 characters').max(2000, 'Description too long'),
  type: z.enum(['OPEN', 'COMMUNITY', 'COLLEGE_FUNDED']),
  genre: z.enum(['TECH', 'ART', 'MUSIC', 'DANCE', 'SPORTS', 'OTHER']),
  location: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  frequency: z.enum(['ONE_OFF', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'ON_DEMAND']),
  capacity: z.number().int().min(1).optional(),
})

export const openActivitySchema = baseActivitySchema.extend({
  type: z.literal('OPEN'),
  meetingPointDetails: z.string().optional(),
  expectedDurationMinutes: z.number().int().min(1).optional(),
})

export const communityActivitySchema = baseActivitySchema.extend({
  type: z.literal('COMMUNITY'),
  communityName: z.string().min(3, 'Community name must be at least 3 characters').max(50, 'Community name too long'),
  goals: z.string().min(10, 'Goals must be at least 10 characters'),
  meetingFrequency: z.enum(['WEEKLY', 'MONTHLY', 'ON_DEMAND']),
  firstMeetDate: z.string().optional().nullable(),
  coOrganisers: z.array(z.string()).optional(),
  publicPrivate: z.enum(['PUBLIC', 'PRIVATE']).optional(),
})

export const fundedActivitySchema = baseActivitySchema.extend({
  type: z.literal('COLLEGE_FUNDED'),
  fundingGoal: z.number().int().min(1, 'Funding goal must be greater than 0'),
  budgetBreakdown: z.array(z.object({
    item: z.string().optional(),
    cost: z.number().int().optional().nullable(),
  })).optional(),
  venueRequirement: z.string().optional(),
  expectedAttendees: z.number().int().optional(),
  safetyPlan: z.string().optional(),
  proposedDates: z.array(z.string()).optional(),
  representativeContact: z.object({
    name: z.string().optional(),
    rollNumber: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
})

// Comment validation
export const commentSchema = z.object({
  text: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
})

// Report validation
export const reportSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(300, 'Reason too long'),
})

// Admin validation
export const verificationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OpenActivityInput = z.infer<typeof openActivitySchema>
export type CommunityActivityInput = z.infer<typeof communityActivitySchema>
export type FundedActivityInput = z.infer<typeof fundedActivitySchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type VerificationActionInput = z.infer<typeof verificationActionSchema>
