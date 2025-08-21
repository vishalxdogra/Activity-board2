import { signupSchema, loginSchema, openActivitySchema, communityActivitySchema, fundedActivitySchema } from '../validation'

describe('Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        rollNumber: 'CS2023/014',
        name: 'John Doe',
        password: 'password123'
      }
      
      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid roll number format', () => {
      const invalidData = {
        rollNumber: 'invalid-format',
        name: 'John Doe',
        password: 'password123'
      }
      
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = {
        rollNumber: 'CS2023/014',
        name: 'John Doe',
        password: '123'
      }
      
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('openActivitySchema', () => {
    it('should validate correct open activity data', () => {
      const validData = {
        title: 'Test Activity',
        description: 'This is a test activity description',
        type: 'OPEN' as const,
        genre: 'TECH' as const,
        frequency: 'ONE_OFF' as const,
        startDate: '2024-12-01T10:00:00.000Z'
      }
      
      const result = openActivitySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require start date for one-off activities', () => {
      const invalidData = {
        title: 'Test Activity',
        description: 'This is a test activity description',
        type: 'OPEN' as const,
        genre: 'TECH' as const,
        frequency: 'ONE_OFF' as const
        // Missing startDate
      }
      
      const result = openActivitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('fundedActivitySchema', () => {
    it('should validate correct funded activity data', () => {
      const validData = {
        title: 'Tech Fest',
        description: 'Annual technology festival',
        type: 'COLLEGE_FUNDED' as const,
        genre: 'TECH' as const,
        frequency: 'ONE_OFF' as const,
        fundingGoal: 100000,
        budgetBreakdown: [
          { item: 'Sound System', cost: 50000 },
          { item: 'Prizes', cost: 50000 }
        ],
        venueRequirement: 'Main Auditorium',
        expectedAttendees: 500,
        safetyPlan: 'Security guards and first aid',
        proposedDates: ['2024-12-01T10:00:00.000Z'],
        representativeContact: {
          name: 'John Doe',
          rollNumber: 'CS2023/014',
          phone: '+919876543210'
        }
      }
      
      const result = fundedActivitySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate budget breakdown matches funding goal', () => {
      const invalidData = {
        title: 'Tech Fest',
        description: 'Annual technology festival',
        type: 'COLLEGE_FUNDED' as const,
        genre: 'TECH' as const,
        frequency: 'ONE_OFF' as const,
        fundingGoal: 100000,
        budgetBreakdown: [
          { item: 'Sound System', cost: 30000 } // Total doesn't match funding goal
        ],
        venueRequirement: 'Main Auditorium',
        expectedAttendees: 500,
        safetyPlan: 'Security guards and first aid',
        proposedDates: ['2024-12-01T10:00:00.000Z'],
        representativeContact: {
          name: 'John Doe',
          rollNumber: 'CS2023/014',
          phone: '+919876543210'
        }
      }
      
      const result = fundedActivitySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
