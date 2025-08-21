'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, Eye, Clock, User } from 'lucide-react'

interface VerificationRequest {
  id: string
  idImageUrl: string
  status: string
  createdAt: string
  note?: string
  user: {
    id: string
    rollNumber: string
    name: string
    email?: string
    createdAt: string
  }
}

export default function AdminVerifyPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      const response = await fetch('/api/admin/verification-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.verificationRequests)
      } else if (response.status === 403) {
        alert('Admin access required')
        router.push('/dashboard')
      } else if (response.status === 401) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Failed to fetch verification requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    const note = prompt('Add a note (optional):')
    setProcessing(requestId)

    try {
      const response = await fetch(`/api/admin/verification-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })

      if (response.ok) {
        alert('Verification approved successfully!')
        fetchVerificationRequests()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve verification')
      }
    } catch (error) {
      console.error('Failed to approve verification:', error)
      alert('Failed to approve verification')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    const note = prompt('Rejection reason (required):')
    if (!note || note.trim().length < 5) {
      alert('Please provide a valid rejection reason')
      return
    }

    setProcessing(requestId)

    try {
      const response = await fetch(`/api/admin/verification-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      })

      if (response.ok) {
        alert('Verification rejected successfully!')
        fetchVerificationRequests()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject verification')
      }
    } catch (error) {
      console.error('Failed to reject verification:', error)
      alert('Failed to reject verification')
    } finally {
      setProcessing(null)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
          <p className="text-gray-600 mt-2">Review and approve student ID verification requests</p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No pending verification requests</p>
              <p className="text-gray-400 mt-2">All caught up! Check back later for new requests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.user.name}</CardTitle>
                      <CardDescription>{request.user.rollNumber}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      Pending
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>Email:</strong> {request.user.email || 'Not provided'}</p>
                    <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    <p><strong>Account created:</strong> {new Date(request.user.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Student ID:</p>
                    <div className="relative">
                      <img
                        src={request.idImageUrl}
                        alt="Student ID"
                        className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setSelectedImage(request.idImageUrl)}
                      />
                      <button
                        onClick={() => setSelectedImage(request.idImageUrl)}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={processing === request.id}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>

                  {processing === request.id && (
                    <div className="text-center">
                      <p className="text-sm text-blue-600">Processing...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Student ID - Full Size"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
