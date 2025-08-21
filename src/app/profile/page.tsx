'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Upload, CheckCircle, Clock, XCircle, User } from 'lucide-react'

interface User {
  id: string
  rollNumber: string
  name: string
  email?: string
  profilePicUrl?: string
  isVerified: boolean
  isAdmin: boolean
  createdAt: string
  verificationRequest?: {
    status: string
    createdAt: string
    note?: string
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
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
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || '',
        })
      } else if (response.status === 401) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPEG, PNG, or PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('idImage', file)

      const response = await fetch('/api/users/me/verify', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('ID uploaded successfully! Your verification request is now pending.')
        fetchUser() // Refresh user data
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to upload ID')
      }
    } catch (error) {
      console.error('Failed to upload ID:', error)
      alert('Failed to upload ID')
    } finally {
      setUploading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        alert('Profile updated successfully!')
        fetchUser()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const getVerificationStatus = () => {
    if (user?.isVerified) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: 'Verified',
        color: 'text-green-700 bg-green-50 border-green-200'
      }
    }
    
    if (user?.verificationRequest) {
      const status = user.verificationRequest.status
      if (status === 'PENDING') {
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          text: 'Verification Pending',
          color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
        }
      } else if (status === 'REJECTED') {
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: 'Verification Rejected',
          color: 'text-red-700 bg-red-50 border-red-200'
        }
      }
    }
    
    return {
      icon: <User className="h-5 w-5 text-gray-500" />,
      text: 'Not Verified',
      color: 'text-gray-700 bg-gray-50 border-gray-200'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">Failed to load profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const verificationStatus = getVerificationStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and verification status</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number
                  </label>
                  <Input value={user.rollNumber} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Roll number cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                  />
                </div>

                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Upload your student ID to get verified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${verificationStatus.color}`}>
                  {verificationStatus.icon}
                  <div>
                    <p className="font-medium">{verificationStatus.text}</p>
                    {user.verificationRequest && (
                      <p className="text-sm opacity-75">
                        Submitted on {new Date(user.verificationRequest.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {user.verificationRequest?.status === 'REJECTED' && user.verificationRequest.note && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {user.verificationRequest.note}
                    </p>
                  </div>
                )}

                {!user.isVerified && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Why get verified?</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Create and organize activities</li>
                        <li>• Get a verified badge next to your name</li>
                        <li>• Build trust in the community</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Student ID
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> your student ID
                            </p>
                            <p className="text-xs text-gray-500">JPEG, PNG, or PDF (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      {uploading && (
                        <div className="mt-2 text-center">
                          <p className="text-sm text-blue-600">Uploading...</p>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Make sure your student ID is clearly visible</p>
                      <p>• Supported formats: JPEG, PNG, PDF</p>
                      <p>• Maximum file size: 5MB</p>
                      <p>• Verification typically takes 1-2 business days</p>
                    </div>
                  </div>
                )}

                {user.isVerified && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      🎉 Congratulations! Your account is verified. You can now create activities and enjoy all the benefits of being a verified member.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{user.rollNumber}</p>
                <p className="text-sm text-blue-800">Roll Number</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {user.isVerified ? 'Verified' : 'Pending'}
                </p>
                <p className="text-sm text-green-800">Status</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-purple-800">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
