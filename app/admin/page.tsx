'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  MessageSquare,
  Activity,
  TrendingUp,
  Database,
  BarChart3,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  Clock,
  Shield
} from 'lucide-react'

// Interfaces
interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  organization: string | null
  position: string | null
  aapcId: string | null
  ahimaId: string | null
  role: string
  createdAt: string
  updatedAt: string
}

interface Review {
  _id: string
  name: string
  email: string
  role: string
  location: string
  country: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt?: string
}

interface Stats {
  totalUsers: number
  totalReviews: number
  pendingReviews: number
  approvedReviews: number
  rejectedReviews: number
}

type TabType = 'overview' | 'users' | 'reviews'

export default function AdminDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0
  })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  
  // Filter states
  const [userSearch, setUserSearch] = useState('')
  const [reviewSearch, setReviewSearch] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // UI states
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      if (!response.ok) {
        router.push('/login')
        return
      }

      const data = await response.json()
      
      if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'superadmin')) {
        router.push('/dashboard')
        return
      }

      setCurrentUser(data.user)
      await loadAllData()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function loadAllData() {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadReviews()
    ])
  }

  async function loadStats() {
    try {
      // Load reviews stats
      const reviewsRes = await fetch('/api/reviews')
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        const allReviews = reviewsData.reviews || []
        
        setStats(prev => ({
          ...prev,
          totalReviews: allReviews.length,
          pendingReviews: allReviews.filter((r: Review) => r.status === 'pending').length,
          approvedReviews: allReviews.filter((r: Review) => r.status === 'approved').length,
          rejectedReviews: allReviews.filter((r: Review) => r.status === 'rejected').length
        }))
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  async function loadUsers() {
    try {
      // Note: You'll need to create an admin API endpoint to list users
      // For now, we'll show a placeholder
      setUsers([])
      showNotification('info', 'User management API endpoint needs to be created')
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  async function loadReviews() {
    try {
      const response = await fetch('/api/reviews?admin=true')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'pending') {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        showNotification('success', `Review ${status} successfully`)
        await loadReviews()
        await loadStats()
      } else {
        showNotification('error', 'Failed to update review')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      showNotification('error', 'Failed to update review')
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('success', 'Review deleted successfully')
        await loadReviews()
        await loadStats()
      } else {
        showNotification('error', 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      showNotification('error', 'Failed to delete review')
    }
  }

  function showNotification(type: 'success' | 'error' | 'info', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                         review.email.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                         review.comment.toLowerCase().includes(reviewSearch.toLowerCase())
    const matchesFilter = reviewFilter === 'all' || review.status === reviewFilter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {currentUser?.email}
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`max-w-7xl mx-auto px-4 mt-4`}>
          <div className={`p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
            notification.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-border">
          {(['overview', 'users', 'reviews'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalReviews}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.pendingReviews}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Reviews</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.approvedReviews}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
                />
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground text-center py-12">
                User management functionality coming soon. Create /api/users endpoint to enable this feature.
              </p>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value as any)}
                className="px-4 py-2 bg-background border border-border rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredReviews.map(review => (
                <div key={review._id} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{review.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          review.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          review.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {review.status}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.email} • {review.role}</p>
                      <p className="text-sm text-muted-foreground mb-3">{review.location}, {review.country}</p>
                      <p className="text-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {review.status !== 'approved' && (
                        <button
                          onClick={() => updateReviewStatus(review._id, 'approved')}
                          className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button
                          onClick={() => updateReviewStatus(review._id, 'rejected')}
                          className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="p-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredReviews.length === 0 && (
                <div className="bg-card p-12 rounded-lg border border-border text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
