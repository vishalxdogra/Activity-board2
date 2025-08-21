'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, MessageCircle, Users, MapPin, Calendar, Flag, CheckCircle, Clock } from 'lucide-react'
import { formatDateTime, getFrequencyLabel, getGenreLabel, getTypeLabel } from '@/lib/utils'

interface Activity {
  id: string
  title: string
  description: string
  type: string
  genre: string
  location?: string
  startDate?: string
  endDate?: string
  frequency: string
  capacity?: number
  likeCount: number
  commentCount: number
  joinedCount: number
  author: {
    id: string
    name: string
    rollNumber: string
    isVerified: boolean
  }
  createdAt: string
  applicationForm?: any
  templatesUsed?: any
}

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    id: string
    name: string
    rollNumber: string
    isVerified: boolean
  }
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)
  const [joined, setJoined] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchActivity()
    fetchComments()
  }, [params.id])

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setActivity(data.activity)
      } else if (response.status === 404) {
        alert('Activity not found')
        router.push('/dashboard')
      } else if (response.status === 401) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/like`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        fetchActivity() // Refresh activity data
      }
    } catch (error) {
      console.error('Failed to like activity:', error)
    }
  }

  const handleJoin = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/join`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setJoined(true)
        fetchActivity() // Refresh activity data
        alert('Successfully joined the activity!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to join activity')
      }
    } catch (error) {
      console.error('Failed to join activity:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/activities/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      })

      if (response.ok) {
        setCommentText('')
        fetchComments()
        fetchActivity() // Refresh comment count
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReport = async () => {
    const reason = prompt('Please provide a reason for reporting this activity:')
    if (!reason || reason.trim().length < 10) {
      alert('Please provide a valid reason (at least 10 characters)')
      return
    }

    try {
      const response = await fetch(`/api/activities/${params.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      
      if (response.ok) {
        alert('Report submitted successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Failed to report activity:', error)
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

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">Activity not found</p>
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
        {/* Activity Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getTypeLabel(activity.type)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {getGenreLabel(activity.genre)}
                  </span>
                </div>
                <CardTitle className="text-2xl mb-2">{activity.title}</CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>by {activity.author.name}</span>
                  {activity.author.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span>•</span>
                  <span>{activity.author.rollNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
            </div>

            {/* Activity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {activity.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{activity.location}</span>
                </div>
              )}
              
              {activity.startDate && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(activity.startDate)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{getFrequencyLabel(activity.frequency)}</span>
              </div>
              
              {activity.capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{activity.joinedCount}/{activity.capacity} joined</span>
                </div>
              )}
            </div>

            {/* College Funded Details */}
            {activity.type === 'COLLEGE_FUNDED' && activity.applicationForm && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Funding Request Details</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Funding Goal:</strong> ₹{activity.applicationForm.fundingGoal?.toLocaleString()}</p>
                  <p><strong>Expected Attendees:</strong> {activity.applicationForm.expectedAttendees}</p>
                  <p><strong>Venue:</strong> {activity.applicationForm.venueRequirement}</p>
                  {activity.applicationForm.representativeContact && (
                    <p><strong>Contact:</strong> {activity.applicationForm.representativeContact.name} ({activity.applicationForm.representativeContact.rollNumber})</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{activity.likeCount}</span>
                </button>
                
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageCircle className="h-5 w-5" />
                  <span>{activity.commentCount}</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="h-5 w-5" />
                  <span>{activity.joinedCount}</span>
                </div>
              </div>

              <Button
                onClick={handleJoin}
                disabled={joined}
                className={joined ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {joined ? 'Joined' : 'Join Activity'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  maxLength={1000}
                />
                <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.user.name}</span>
                      {comment.user.isVerified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
