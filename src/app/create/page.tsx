'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

interface User {
  isVerified: boolean
}

export default function CreateActivityPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [activityType, setActivityType] = useState<'OPEN' | 'COMMUNITY' | 'COLLEGE_FUNDED'>('OPEN')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    genre: 'TECH',
    location: '',
    startDate: '',
    endDate: '',
    frequency: 'ONE_OFF',
    capacity: '',
    
    // OPEN specific
    meetingPointDetails: '',
    expectedDurationMinutes: '',
    
    // COMMUNITY specific
    communityName: '',
    goals: '',
    meetingFrequency: 'WEEKLY',
    firstMeetDate: '',
    publicPrivate: 'PUBLIC',
    
    // COLLEGE_FUNDED specific
    fundingGoal: '',
    budgetBreakdown: [{ item: '', cost: '' }],
    venueRequirement: '',
    expectedAttendees: '',
    safetyPlan: '',
    proposedDates: [''],
    representativeContact: {
      name: '',
      rollNumber: '',
      phone: '',
      email: ''
    }
  })
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBudgetChange = (index: number, field: 'item' | 'cost', value: string) => {
    const newBudget = [...formData.budgetBreakdown]
    newBudget[index] = { ...newBudget[index], [field]: value }
    setFormData(prev => ({ ...prev, budgetBreakdown: newBudget }))
  }

  const addBudgetItem = () => {
    setFormData(prev => ({
      ...prev,
      budgetBreakdown: [...prev.budgetBreakdown, { item: '', cost: '' }]
    }))
  }

  const removeBudgetItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      budgetBreakdown: prev.budgetBreakdown.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      // Prepare submission data based on type
      let submitData: any = {
        title: formData.title,
        description: formData.description,
        type: activityType,
        genre: formData.genre,
        location: formData.location || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        frequency: formData.frequency,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      }

      if (activityType === 'OPEN') {
        submitData.meetingPointDetails = formData.meetingPointDetails || undefined
        submitData.expectedDurationMinutes = formData.expectedDurationMinutes ? parseInt(formData.expectedDurationMinutes) : undefined
      } else if (activityType === 'COMMUNITY') {
        submitData.communityName = formData.communityName
        submitData.goals = formData.goals
        submitData.meetingFrequency = formData.meetingFrequency
        submitData.firstMeetDate = formData.firstMeetDate ? new Date(formData.firstMeetDate).toISOString() : undefined
        submitData.publicPrivate = formData.publicPrivate
      } else if (activityType === 'COLLEGE_FUNDED') {
        submitData.fundingGoal = parseInt(formData.fundingGoal)
        submitData.budgetBreakdown = formData.budgetBreakdown.map(item => ({
          item: item.item,
          cost: parseInt(item.cost)
        }))
        submitData.venueRequirement = formData.venueRequirement
        submitData.expectedAttendees = parseInt(formData.expectedAttendees)
        submitData.safetyPlan = formData.safetyPlan
        submitData.proposedDates = formData.proposedDates.filter(date => date)
        submitData.representativeContact = formData.representativeContact
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Activity created successfully!')
        router.push(`/activity/${data.activity.id}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create activity')
      }
    } catch (error) {
      console.error('Failed to create activity:', error)
      alert('Failed to create activity')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card>
            <CardHeader>
              <CardTitle>Verification Required</CardTitle>
              <CardDescription>
                You need to be verified to create activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Only verified users can create activities. Please upload your student ID for verification.
              </p>
              <Button onClick={() => router.push('/profile')}>
                Go to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Activity</h1>
          <p className="text-gray-600 mt-2">Share your activity with the college community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-20 h-1 mx-4 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Choose Type</span>
            <span>Basic Info</span>
            <span>Details</span>
          </div>
        </div>

        {/* Step 1: Choose Activity Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Choose Activity Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  type: 'OPEN' as const,
                  title: 'Open Event',
                  description: 'Simple meetups and casual activities open to everyone',
                  examples: 'Study groups, casual sports, hobby meetups'
                },
                {
                  type: 'COMMUNITY' as const,
                  title: 'Community',
                  description: 'Ongoing groups you want to build and maintain',
                  examples: 'Dance communities, coding clubs, art circles'
                },
                {
                  type: 'COLLEGE_FUNDED' as const,
                  title: 'College Funded',
                  description: 'Formal events requiring college funding and approval',
                  examples: 'Tech fests, cultural events, competitions'
                }
              ].map((template) => (
                <Card
                  key={template.type}
                  className={`cursor-pointer transition-all ${
                    activityType === template.type ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActivityType(template.type)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      <strong>Examples:</strong> {template.examples}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a catchy title (5-120 characters)"
                  maxLength={120}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your activity (15-2000 characters)"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TECH">Technology</option>
                  <option value="ART">Art</option>
                  <option value="MUSIC">Music</option>
                  <option value="DANCE">Dance</option>
                  <option value="SPORTS">Sports</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ONE_OFF">One-time</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="FORTNIGHTLY">Fortnightly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="ON_DEMAND">On-demand</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Amphitheatre, Online, Main Hall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  placeholder="Maximum participants"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date {formData.frequency === 'ONE_OFF' && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required={formData.frequency === 'ONE_OFF'}
                />
                {formData.frequency === 'ONE_OFF' && !formData.startDate && (
                  <p className="text-red-500 text-sm mt-1">Start date is required for one-off events</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Type-specific Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {activityType === 'OPEN' && 'Open Event Details'}
              {activityType === 'COMMUNITY' && 'Community Details'}
              {activityType === 'COLLEGE_FUNDED' && 'Funding Request Details'}
            </h2>

            {/* OPEN Event Details */}
            {activityType === 'OPEN' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Point Details
                  </label>
                  <Input
                    value={formData.meetingPointDetails}
                    onChange={(e) => handleInputChange('meetingPointDetails', e.target.value)}
                    placeholder="e.g., Near main gate, Library entrance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.expectedDurationMinutes}
                    onChange={(e) => handleInputChange('expectedDurationMinutes', e.target.value)}
                    placeholder="e.g., 120"
                    min="1"
                  />
                </div>
              </div>
            )}

            {/* COMMUNITY Details */}
            {activityType === 'COMMUNITY' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Name *
                  </label>
                  <Input
                    value={formData.communityName}
                    onChange={(e) => handleInputChange('communityName', e.target.value)}
                    placeholder="e.g., Campus Movers, Code Club"
                    maxLength={50}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goals *
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    placeholder="What do you want to achieve with this community?"
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Frequency *
                  </label>
                  <select
                    value={formData.meetingFrequency}
                    onChange={(e) => handleInputChange('meetingFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ON_DEMAND">On-demand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Meeting Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.firstMeetDate}
                    onChange={(e) => handleInputChange('firstMeetDate', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* COLLEGE_FUNDED Details */}
            {activityType === 'COLLEGE_FUNDED' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funding Goal (₹) *
                    </label>
                    <Input
                      type="number"
                      value={formData.fundingGoal}
                      onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                      placeholder="e.g., 50000"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Attendees *
                    </label>
                    <Input
                      type="number"
                      value={formData.expectedAttendees}
                      onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
                      placeholder="e.g., 300"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Breakdown *
                  </label>
                  {formData.budgetBreakdown.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Item name"
                        value={item.item}
                        onChange={(e) => handleBudgetChange(index, 'item', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Cost (₹)"
                        value={item.cost}
                        onChange={(e) => handleBudgetChange(index, 'cost', e.target.value)}
                        className="w-32"
                        min="0"
                      />
                      {formData.budgetBreakdown.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBudgetItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addBudgetItem}>
                    Add Budget Item
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Requirement *
                  </label>
                  <Input
                    value={formData.venueRequirement}
                    onChange={(e) => handleInputChange('venueRequirement', e.target.value)}
                    placeholder="e.g., Main Auditorium, Open Ground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Plan *
                  </label>
                  <textarea
                    value={formData.safetyPlan}
                    onChange={(e) => handleInputChange('safetyPlan', e.target.value)}
                    placeholder="Describe safety measures and emergency plans"
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Representative Contact *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={formData.representativeContact.name}
                      onChange={(e) => handleInputChange('representativeContact', {
                        ...formData.representativeContact,
                        name: e.target.value
                      })}
                    />
                    <Input
                      placeholder="Roll Number"
                      value={formData.representativeContact.rollNumber}
                      onChange={(e) => handleInputChange('representativeContact', {
                        ...formData.representativeContact,
                        rollNumber: e.target.value
                      })}
                    />
                    <Input
                      placeholder="Phone Number"
                      value={formData.representativeContact.phone}
                      onChange={(e) => handleInputChange('representativeContact', {
                        ...formData.representativeContact,
                        phone: e.target.value
                      })}
                    />
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={formData.representativeContact.email}
                      onChange={(e) => handleInputChange('representativeContact', {
                        ...formData.representativeContact,
                        email: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Activity'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
