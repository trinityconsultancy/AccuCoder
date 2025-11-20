'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Users,
  MessageSquare,
  Mail,
  Activity,
  TrendingUp,
  Database,
  Settings,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  Send,
  Clock,
  AlertCircle,
  Eye,
  Download,
  FileText,
  Globe,
  Zap,
  Shield,
  BookOpen
} from 'lucide-react'

// Interfaces
interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  organization: string | null
  position: string | null
  aapc_id: string | null
  ahima_id: string | null
  role: string
  created_at: string
  updated_at: string
}

interface Review {
  id: string
  name: string
  email: string
  role: string
  location: string
  country: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at?: string
}

interface EmailQueueItem {
  id: string
  recipient: string
  subject: string
  message: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number
  created_at: string
  sent_at?: string
}

interface Stats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalReviews: number
  pendingReviews: number
  approvedReviews: number
  pendingEmails: number
  totalOrganizations: number
}

type TabType = 'overview' | 'users' | 'reviews' | 'emails' | 'codes' | 'analytics' | 'settings'

export default function AdminDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    pendingEmails: 0,
    totalOrganizations: 0
  })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([])
  
  // Filter states
  const [userSearch, setUserSearch] = useState('')
  const [reviewSearch, setReviewSearch] = useState('')
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [codeSearch, setCodeSearch] = useState('')
  
  // UI states
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        router.push('/dashboard')
        return
      }

      setCurrentUser(profile)
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
      loadUsers(),
      loadReviews(),
      loadEmailQueue(),
      loadStats()
    ])
  }

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  async function loadReviews() {
    try {
      const response = await fetch('/api/reviews?admin=true')
      const data = await response.json()
      
      if (data.reviews) {
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  async function loadEmailQueue() {
    try {
      const response = await fetch('/api/send-email')
      const data = await response.json()
      
      if (data.success && data.emails) {
        setEmailQueue(data.emails)
      }
    } catch (error) {
      console.error('Error loading email queue:', error)
    }
  }

  async function loadStats() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newToday = users.filter(u => 
        new Date(u.created_at) >= today
      ).length

      const uniqueOrgs = new Set(
        users.filter(u => u.organization).map(u => u.organization)
      ).size

      setStats({
        totalUsers: users.length,
        activeUsers: users.length,
        newUsersToday: newToday,
        totalReviews: reviews.length,
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        approvedReviews: reviews.filter(r => r.status === 'approved').length,
        pendingEmails: emailQueue.filter(e => e.status === 'pending').length,
        totalOrganizations: uniqueOrgs
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update review')
      
      showNotification('success', `Review ${status} successfully`)
      await loadReviews()
      await loadStats()
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

      if (!response.ok) throw new Error('Failed to delete review')
      
      showNotification('success', 'Review deleted successfully')
      await loadReviews()
      await loadStats()
    } catch (error) {
      console.error('Error deleting review:', error)
      showNotification('error', 'Failed to delete review')
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      showNotification('success', `User role updated to ${newRole}`)
      await loadUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      showNotification('error', 'Failed to update user role')
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      showNotification('success', 'User deleted successfully')
      await loadUsers()
      await loadStats()
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('error', 'Failed to delete user')
    }
  }

  function showNotification(type: 'success' | 'error' | 'info', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Filter data
  const filteredUsers = users.filter(u =>
    u.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.last_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.organization?.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                         r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                         r.country.toLowerCase().includes(reviewSearch.toLowerCase())
    const matchesFilter = reviewFilter === 'all' || r.status === reviewFilter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' :
          notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white flex items-center gap-2 animate-smooth-fade-slide`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Welcome back, {currentUser.first_name} •
                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  {currentUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh All Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
            subtitle={`${stats.newUsersToday} new today`}
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={MessageSquare}
            color="orange"
            subtitle={`${stats.approvedReviews} approved`}
          />
          <StatCard
            title="Email Queue"
            value={stats.pendingEmails}
            icon={Mail}
            color="purple"
            subtitle="Pending delivery"
          />
          <StatCard
            title="Organizations"
            value={stats.totalOrganizations}
            icon={Database}
            color="green"
            subtitle="Unique companies"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={BarChart3}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={Users}
              label="Users"
              badge={stats.totalUsers}
            />
            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
              icon={MessageSquare}
              label="Reviews"
              badge={stats.pendingReviews}
            />
            <TabButton
              active={activeTab === 'emails'}
              onClick={() => setActiveTab('emails')}
              icon={Mail}
              label="Emails"
              badge={stats.pendingEmails}
            />
            <TabButton
              active={activeTab === 'codes'}
              onClick={() => setActiveTab('codes')}
              icon={BookOpen}
              label="ICD Codes"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={TrendingUp}
              label="Analytics"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={Settings}
              label="Settings"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} users={users} reviews={reviews} />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={filteredUsers}
              searchTerm={userSearch}
              setSearchTerm={setUserSearch}
              updateUserRole={updateUserRole}
              deleteUser={deleteUser}
              currentUserRole={currentUser.role}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={filteredReviews}
              searchTerm={reviewSearch}
              setSearchTerm={setReviewSearch}
              filter={reviewFilter}
              setFilter={setReviewFilter}
              updateStatus={updateReviewStatus}
              deleteReview={deleteReview}
              loadReviews={loadReviews}
            />
          )}

          {activeTab === 'emails' && (
            <EmailsTab
              emailQueue={emailQueue}
              loadEmailQueue={loadEmailQueue}
            />
          )}

          {activeTab === 'codes' && (
            <CodesTab
              searchTerm={codeSearch}
              setSearchTerm={setCodeSearch}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab stats={stats} users={users} reviews={reviews} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab currentUser={currentUser} />
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string
  value: number
  icon: any
  color: 'blue' | 'orange' | 'purple' | 'green'
  subtitle?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean
  onClick: () => void
  icon: any
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
        active
          ? 'text-primary border-b-2 border-primary bg-primary/5'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

// Overview Tab
function OverviewTab({ stats, users, reviews }: {
  stats: Stats
  users: UserProfile[]
  reviews: Review[]
}) {
  const recentUsers = users.slice(0, 5)
  const recentReviews = reviews.slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Users */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Recent Users
        </h3>
        <div className="space-y-3">
          {recentUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          Recent Reviews
        </h3>
        <div className="space-y-3">
          {recentReviews.map(review => (
            <div key={review.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-slate-900 dark:text-white">{review.name}</p>
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{review.comment}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                review.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                review.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {review.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReviews}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Reviews</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingReviews}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Pending Reviews</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrganizations}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Organizations</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Users Tab
function UsersTab({ users, searchTerm, setSearchTerm, updateUserRole, deleteUser, currentUserRole }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Management ({users.length})
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Certifications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user: UserProfile) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                  {user.organization || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.aapc_id && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        AAPC
                      </span>
                    )}
                    {user.ahima_id && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        AHIMA
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {currentUserRole === 'superadmin' ? (
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Reviews Tab
function ReviewsTab({ reviews, searchTerm, setSearchTerm, filter, setFilter, updateStatus, deleteReview, loadReviews }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            Review Management ({reviews.length})
          </h3>
          <button
            onClick={loadReviews}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review: Review) => (
                <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{review.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{review.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 dark:text-white">{review.country}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{review.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 dark:text-white max-w-xs truncate">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      review.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(review.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => updateStatus(review.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Emails Tab
function EmailsTab({ emailQueue, loadEmailQueue }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Email Queue ({emailQueue.length})
        </h3>
        <button
          onClick={loadEmailQueue}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {emailQueue.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No emails in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emailQueue.map((email: EmailQueueItem) => (
            <div key={email.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-slate-900 dark:text-white">{email.recipient}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  email.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  email.status === 'sent' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {email.status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{email.subject}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{email.message}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Created: {new Date(email.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Codes Tab - ICD Code Management
function CodesTab({ searchTerm, setSearchTerm }: any) {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCodes()
  }, [searchTerm])

  async function loadCodes() {
    setLoading(true)
    try {
      // TODO: Implement ICD code search API
      // For now, showing placeholder
      setCodes([])
    } catch (error) {
      console.error('Error loading codes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        ICD Code Management
      </h3>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search ICD codes, diseases, chemicals, drugs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 mb-2">ICD Code Editor</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          Search and edit ICD-10 codes, diseases, chemicals, and drugs
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-4">
          Feature coming soon - API integration required
        </p>
      </div>
    </div>
  )
}

// Analytics Tab
function AnalyticsTab({ stats, users, reviews }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            User Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Users</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">New Today</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.newUsersToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Organizations</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalOrganizations}</span>
            </div>
          </div>
        </div>

        {/* Review Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            Review Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Reviews</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalReviews}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingReviews}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Approved</span>
              <span className="text-lg font-bold text-green-600">{stats.approvedReviews}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter((r: Review) => r.rating === rating).length
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Settings Tab
function SettingsTab({ currentUser }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-600" />
        System Settings
      </h3>

      <div className="space-y-6">
        {/* Admin Info */}
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">Administrator Information</h4>
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Name:</span> <span className="font-medium text-slate-900 dark:text-white">{currentUser.first_name} {currentUser.last_name}</span></p>
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Email:</span> <span className="font-medium text-slate-900 dark:text-white">{currentUser.email}</span></p>
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Role:</span> <span className="font-medium text-slate-900 dark:text-white">{currentUser.role}</span></p>
          </div>
        </div>

        {/* System Info */}
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">System Information</h4>
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Platform:</span> <span className="font-medium text-slate-900 dark:text-white">AccuCoder</span></p>
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Version:</span> <span className="font-medium text-slate-900 dark:text-white">1.0.0</span></p>
            <p className="text-sm"><span className="text-slate-600 dark:text-slate-400">Environment:</span> <span className="font-medium text-slate-900 dark:text-white">Production</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
