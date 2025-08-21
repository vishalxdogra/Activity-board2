'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ActivityCard from '@/components/ActivityCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Filter } from 'lucide-react'

interface Activity {
  id: string
  title: string
  description: string
  type: string
  genre: string
  location?: string
  startDate?: string
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
}

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    genre: 'ALL',
    type: 'ALL',
    frequency: 'ALL',
    sort: 'newest'
  })
  const router = useRouter()

  useEffect(() => {
    fetchActivities()
  }, [filters])

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...(filters.genre !== 'ALL' && { genre: filters.genre }),
        ...(filters.type !== 'ALL' && { type: filters.type }),
        ...(filters.frequency !== 'ALL' && { frequency: filters.frequency }),
        sort: filters.sort,
      })

      const response = await fetch(`/api/activities?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      } else if (response.status === 401) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchActivities()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">All Genres</option>
              <option value="TECH">Technology</option>
              <option value="ART">Art</option>
              <option value="MUSIC">Music</option>
              <option value="DANCE">Dance</option>
              <option value="SPORTS">Sports</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">All Types</option>
              <option value="OPEN">Open Event</option>
              <option value="COMMUNITY">Community</option>
              <option value="COLLEGE_FUNDED">College Funded</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="newest">Newest</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No activities found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onLike={fetchActivities}
                onJoin={fetchActivities}
                onReport={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
