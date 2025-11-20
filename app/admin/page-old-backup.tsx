'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Shield,
  Settings,
  Activity,
  Database,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Mail,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Plus,
  MoreVertical,
  UserPlus,
  UserMinus,
  Building2,
  Award,
  BookOpen,
  MessageSquare,
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react'

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

interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: string
  timestamp: string
  user_email?: string
}

interface EmailQueueItem {
  id: string
  to: string
  subject: string
  message: string
  status: 'pending' | 'sending' | 'sent' | 'failed'
  attempts: number
  max_attempts: number
  scheduled_for: string
  sent_at?: string
  error?: string
  created_at: string
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

interface SystemStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  totalOrganizations: number
  adminUsers: number
  superAdminUsers: number
  userGrowth: number
  averageSessionTime: string
}

type TabType = 'dashboard' | 'users' | 'activity' | 'analytics' | 'reviews' | 'settings' | 'database' | 'security' | 'emails'

export default function AdminPanel() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalOrganizations: 0,
    adminUsers: 0,
    superAdminUsers: 0,
    userGrowth: 0,
    averageSessionTime: '0m'
  })
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([])
  const [emailWorkerRunning, setEmailWorkerRunning] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'role' | 'delete' | 'export' | null>(null)
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all')
  const [reviewSearchTerm, setReviewSearchTerm] = useState('')

  // Check if user is admin/superadmin
  useEffect(() => {
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
          router.push('/index')
          return
        }

        setCurrentUser(profile)
        await loadData()
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Load all data
  async function loadData() {
    await Promise.all([
      loadUsers(),
      loadStats(),
      loadActivityLogs(),
      loadEmailQueue(),
      loadReviews()
    ])
  }

  // Load email queue
  async function loadEmailQueue() {
    try {
      const response = await fetch('/api/send-email')
      const data = await response.json()
      
      if (data.success) {
        setEmailQueue(data.emails || [])
      }
    } catch (error) {
      console.error('Error loading email queue:', error)
      setEmailQueue([])
    }
  }

  // Load reviews
  async function loadReviews() {
    try {
      const response = await fetch('/api/reviews?admin=true')
      const data = await response.json()
      
      if (data.reviews) {
        setReviews(data.reviews)
        setFilteredReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([])
      setFilteredReviews([])
    }
  }

  // Start email worker
  async function startEmailWorker() {
    try {
      const response = await fetch('/api/email-worker', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setEmailWorkerRunning(true)
        showNotification('success', 'Email worker started successfully')
      }
    } catch (error) {
      console.error('Error starting email worker:', error)
      showNotification('error', 'Failed to start email worker')
    }
  }

  // Stop email worker
  async function stopEmailWorker() {
    try {
      const response = await fetch('/api/email-worker', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setEmailWorkerRunning(false)
        showNotification('success', 'Email worker stopped successfully')
      }
    } catch (error) {
      console.error('Error stopping email worker:', error)
      showNotification('error', 'Failed to stop email worker')
    }
  }

  // Load users
  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  // Load statistics
  async function loadStats() {
    try {
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('*')

      if (allUsers) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const newToday = allUsers.filter(u => 
          new Date(u.created_at) >= today
        ).length

        const uniqueOrgs = new Set(
          allUsers.filter(u => u.organization).map(u => u.organization)
        ).size

        const admins = allUsers.filter(u => u.role === 'admin').length
        const superAdmins = allUsers.filter(u => u.role === 'superadmin').length

        setStats({
          totalUsers: allUsers.length,
          activeUsers: allUsers.length, // Can be enhanced with actual activity tracking
          newUsersToday: newToday,
          totalOrganizations: uniqueOrgs,
          adminUsers: admins,
          superAdminUsers: superAdmins,
          userGrowth: 12.5, // Mock data - can calculate from historical data
          averageSessionTime: '24m' // Mock data
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Load activity logs (fetch recent user activities)
  async function loadActivityLogs() {
    try {
      // Get recent user activities based on updated_at timestamps
      const { data: recentUpdates } = await supabase
        .from('user_profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20)

      if (recentUpdates) {
        const logs: ActivityLog[] = recentUpdates.map((user, index) => ({
          id: `${user.id}-${index}`,
          user_id: user.id,
          action: new Date(user.created_at).getTime() === new Date(user.updated_at).getTime() 
            ? 'New User Registration' 
            : 'Profile Updated',
          details: new Date(user.created_at).getTime() === new Date(user.updated_at).getTime()
            ? `${user.first_name} ${user.last_name} joined AccuCoder`
            : `${user.first_name} ${user.last_name} updated their profile`,
          timestamp: user.updated_at,
          user_email: user.email
        }))
        setActivityLogs(logs)
      }
    } catch (error) {
      console.error('Error loading activity logs:', error)
      setActivityLogs([])
    }
  }

  // Filter users
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.organization?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  // Filter reviews
  useEffect(() => {
    let filtered = reviews

    if (reviewSearchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        r.comment.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        r.country.toLowerCase().includes(reviewSearchTerm.toLowerCase())
      )
    }

    if (reviewStatusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === reviewStatusFilter)
    }

    setFilteredReviews(filtered)
  }, [reviewSearchTerm, reviewStatusFilter, reviews])

  // Update user role
  async function updateUserRole(userId: string, newRole: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      await loadUsers()
      alert(`User role updated to ${newRole}`)
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update user role')
    }
  }

  // Delete user
  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      // First delete from user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      await loadUsers()
      showNotification('success', 'User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('error', 'Failed to delete user. Check console for details.')
    }
  }

  // Bulk delete users
  async function bulkDeleteUsers(userIds: string[]) {
    if (!confirm(`Are you sure you want to delete ${userIds.length} users? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .in('id', userIds)

      if (error) throw error

      await loadUsers()
      setSelectedUsers(new Set())
      showNotification('success', `Successfully deleted ${userIds.length} users`)
    } catch (error) {
      console.error('Error bulk deleting users:', error)
      showNotification('error', 'Failed to delete users')
    }
  }

  // Bulk update roles
  async function bulkUpdateRoles(userIds: string[], newRole: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .in('id', userIds)

      if (error) throw error

      await loadUsers()
      setSelectedUsers(new Set())
      showNotification('success', `Successfully updated ${userIds.length} users to ${newRole}`)
    } catch (error) {
      console.error('Error bulk updating roles:', error)
      showNotification('error', 'Failed to update user roles')
    }
  }

  // Show notification
  function showNotification(type: 'success' | 'error' | 'info', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Update review status
  async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected') {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to update review')
      }

      await loadReviews()
      showNotification('success', `Review ${status} successfully`)
    } catch (error: any) {
      console.error('Error updating review:', error)
      showNotification('error', error.message || 'Failed to update review')
    }
  }

  // Delete review
  async function deleteReview(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to delete review')
      }

      await loadReviews()
      showNotification('success', 'Review deleted successfully')
    } catch (error: any) {
      console.error('Error deleting review:', error)
      showNotification('error', error.message || 'Failed to delete review')
    }
  }

  // Toggle user selection
  function toggleUserSelection(userId: string) {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  // Select all users
  function selectAllUsers() {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  // Send email to user
  async function sendEmailToUser(userEmail: string, subject: string, message: string) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject,
          message
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email')
      }

      showNotification('success', `Email queued successfully to ${userEmail}`)
    } catch (error: any) {
      console.error('Error sending email:', error)
      showNotification('error', error.message || 'Failed to send email')
    }
  }

  // Download user data as CSV
  function downloadCSV(data: UserProfile[], filename: string) {
    const headers = ['First Name', 'Last Name', 'Email', 'Organization', 'Position', 'AAPC ID', 'AHIMA ID', 'Role', 'Joined']
    const rows = data.map(u => [
      u.first_name,
      u.last_name,
      u.email,
      u.organization || '',
      u.position || '',
      u.aapc_id || '',
      u.ahima_id || '',
      u.role,
      new Date(u.created_at).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Copy to clipboard
  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Export data (JSON or CSV)
  function exportData(type: 'users' | 'activity', format: 'json' | 'csv' = 'json') {
    const timestamp = new Date().toISOString().split('T')[0]
    
    if (format === 'csv' && type === 'users') {
      downloadCSV(users, `users-export-${timestamp}.csv`)
      showNotification('success', 'Users exported as CSV')
    } else {
      const data = type === 'users' ? users : activityLogs
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export-${timestamp}.json`
      a.click()
      URL.revokeObjectURL(url)
      showNotification('success', `${type} exported as JSON`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-7 h-7 text-blue-600" />
                Admin Panel
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Welcome back, {currentUser.first_name} • 
                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                  {currentUser.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/index')}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={Users}
            color="blue"
            trend={`+${stats.userGrowth}%`}
          />
          <StatCard
            title="Active Today"
            value={stats.activeUsers.toString()}
            icon={Activity}
            color="green"
            trend={`${stats.newUsersToday} new`}
          />
          <StatCard
            title="Organizations"
            value={stats.totalOrganizations.toString()}
            icon={Building2}
            color="purple"
          />
          <StatCard
            title="Admins"
            value={(stats.adminUsers + stats.superAdminUsers).toString()}
            icon={Shield}
            color="orange"
            subtitle={`${stats.superAdminUsers} super`}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={BarChart3}
              label="Dashboard"
            />
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={Users}
              label="Users"
              badge={users.length}
            />
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              icon={Activity}
              label="Activity Logs"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={TrendingUp}
              label="Analytics"
            />
            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
              icon={MessageSquare}
              label="Reviews"
              badge={reviews.filter(r => r.status === 'pending').length}
            />
            <TabButton
              active={activeTab === 'database'}
              onClick={() => setActiveTab('database')}
              icon={Database}
              label="Database"
            />
            <TabButton
              active={activeTab === 'emails'}
              onClick={() => setActiveTab('emails')}
              icon={Mail}
              label="Email Queue"
              badge={emailQueue.filter(e => e.status === 'pending').length}
            />
            <TabButton
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
              icon={Lock}
              label="Security"
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
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} users={users} activityLogs={activityLogs} />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersTab
              users={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              updateUserRole={updateUserRole}
              deleteUser={deleteUser}
              setSelectedUser={setSelectedUser}
              setShowUserModal={setShowUserModal}
              exportData={exportData}
              copyToClipboard={copyToClipboard}
              copiedId={copiedId}
              currentUserRole={currentUser.role}
              selectedUsers={selectedUsers}
              toggleUserSelection={toggleUserSelection}
              selectAllUsers={selectAllUsers}
              bulkDeleteUsers={bulkDeleteUsers}
              bulkUpdateRoles={bulkUpdateRoles}
              downloadCSV={downloadCSV}
            />
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <ActivityTab
              activityLogs={activityLogs}
              exportData={exportData}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab stats={stats} users={users} />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={filteredReviews}
              searchTerm={reviewSearchTerm}
              setSearchTerm={setReviewSearchTerm}
              statusFilter={reviewStatusFilter}
              setStatusFilter={setReviewStatusFilter}
              updateReviewStatus={updateReviewStatus}
              deleteReview={deleteReview}
              loadReviews={loadReviews}
            />
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <DatabaseTab />
          )}

          {/* Email Queue Tab */}
          {activeTab === 'emails' && (
            <EmailQueueTab
              emailQueue={emailQueue}
              loadEmailQueue={loadEmailQueue}
              emailWorkerRunning={emailWorkerRunning}
              startEmailWorker={startEmailWorker}
              stopEmailWorker={stopEmailWorker}
            />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecurityTab currentUser={currentUser} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsTab currentUser={currentUser} />
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
          updateUserRole={updateUserRole}
          deleteUser={deleteUser}
          currentUserRole={currentUser.role}
          sendEmailToUser={sendEmailToUser}
        />
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle 
}: { 
  title: string
  value: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
  trend?: string
  subtitle?: string
}) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {(trend || subtitle) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {trend && <span className="text-green-600 dark:text-green-400 font-medium">{trend}</span>}
              {subtitle && <span>{subtitle}</span>}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  badge 
}: { 
  active: boolean
  onClick: () => void
  icon: any
  label: string
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {badge}
        </span>
      )}
    </button>
  )
}

// Dashboard Tab
function DashboardTab({ 
  stats, 
  users, 
  activityLogs 
}: { 
  stats: SystemStats
  users: UserProfile[]
  activityLogs: ActivityLog[]
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Recent Sign-ups
          </h3>
          <div className="space-y-3">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activityLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{log.details}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HealthMetric label="Database Status" value="Operational" status="success" />
          <HealthMetric label="Auth Service" value="Operational" status="success" />
          <HealthMetric label="API Response" value="42ms avg" status="success" />
        </div>
      </div>
    </div>
  )
}

function HealthMetric({ label, value, status }: { label: string; value: string; status: 'success' | 'warning' | 'error' }) {
  const statusColors = {
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    error: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  }

  return (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{label}</p>
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  )
}

// Users Tab Component
function UsersTab({
  users,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  updateUserRole,
  deleteUser,
  setSelectedUser,
  setShowUserModal,
  exportData,
  copyToClipboard,
  copiedId,
  currentUserRole,
  selectedUsers,
  toggleUserSelection,
  selectAllUsers,
  bulkDeleteUsers,
  bulkUpdateRoles,
  downloadCSV
}: any) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showBulkMenu, setShowBulkMenu] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Toolbar */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        exportData('users', 'json')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => {
                        downloadCSV(users, `users-export-${new Date().toISOString().split('T')[0]}.csv`)
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      Export as CSV
                    </button>
                    {selectedUsers.size > 0 && (
                      <button
                        onClick={() => {
                          const selected = users.filter((u: UserProfile) => selectedUsers.has(u.id))
                          downloadCSV(selected, `selected-users-${new Date().toISOString().split('T')[0]}.csv`)
                          setShowExportMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border-t border-slate-200 dark:border-slate-600"
                      >
                        Export Selected ({selectedUsers.size})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.size > 0 && currentUserRole === 'superadmin' && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowBulkMenu(!showBulkMenu)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    Bulk Actions
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showBulkMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          if (confirm(`Change role for ${selectedUsers.size} users to User?`)) {
                            bulkUpdateRoles(Array.from(selectedUsers), 'user')
                          }
                          setShowBulkMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        Change to User
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Change role for ${selectedUsers.size} users to Admin?`)) {
                            bulkUpdateRoles(Array.from(selectedUsers), 'admin')
                          }
                          setShowBulkMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        Change to Admin
                      </button>
                      <button
                        onClick={() => {
                          bulkDeleteUsers(Array.from(selectedUsers))
                          setShowBulkMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-red-600 dark:text-red-400 border-t border-slate-200 dark:border-slate-600"
                      >
                        Delete Selected
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => selectAllUsers()}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              {currentUserRole === 'superadmin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Certification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user: UserProfile) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {currentUserRole === 'superadmin' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {user.organization || 'Not specified'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {user.position || 'N/A'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    {user.aapc_id && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        AAPC: {user.aapc_id}
                      </span>
                    )}
                    {user.ahima_id && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                        AHIMA: {user.ahima_id}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowUserModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(user.id, user.id)}
                      className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
                      title="Copy User ID"
                    >
                      {copiedId === user.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    {currentUserRole === 'superadmin' && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No users found</p>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const roleColors = {
    user: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    admin: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    superadmin: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
  }

  const roleLabels = {
    user: 'User',
    admin: 'Admin',
    superadmin: 'Super Admin'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors]}`}>
      {roleLabels[role as keyof typeof roleLabels]}
    </span>
  )
}

// Activity Tab
function ActivityTab({ activityLogs, exportData }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Activity Logs
        </h3>
        <button
          onClick={() => exportData('activity')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>
      <div className="p-6 space-y-4">
        {activityLogs.map((log: ActivityLog) => (
          <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                  {log.user_email && (
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                      User: {log.user_email}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        {activityLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No activity logs yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Analytics Tab
function AnalyticsTab({ stats, users }: { stats: SystemStats; users: UserProfile[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-500 dark:text-slate-400">
            Chart visualization (integrate Chart.js or Recharts)
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Role Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Users</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {users.filter(u => u.role === 'user').length}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(users.filter(u => u.role === 'user').length / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Admins</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {users.filter(u => u.role === 'admin').length}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${(users.filter(u => u.role === 'admin').length / users.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Super Admins</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {users.filter(u => u.role === 'superadmin').length}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(users.filter(u => u.role === 'superadmin').length / users.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Organizations */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          Top Organizations
        </h3>
        <div className="space-y-3">
          {Object.entries(
            users
              .filter(u => u.organization)
              .reduce((acc, u) => {
                acc[u.organization!] = (acc[u.organization!] || 0) + 1
                return acc
              }, {} as Record<string, number>)
          )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([org, count]) => (
              <div key={org} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{org}</span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {count} users
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// Reviews Tab
function ReviewsTab({ 
  reviews, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  updateReviewStatus,
  deleteReview,
  loadReviews
}: any) {
  const getStarColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500'
    if (rating === 3) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      approved: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      rejected: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header with filters */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            User Reviews ({reviews.length})
          </h3>
          <button
            onClick={loadReviews}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Reviews"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews by name, email, comment, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Reviewer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Role & Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No reviews found
                </td>
              </tr>
            ) : (
              reviews.map((review: Review) => (
                <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {review.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {review.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-white">
                      {review.role}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {review.location}, {review.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 ${getStarColor(review.rating)}`}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-white max-w-xs truncate">
                      {review.comment}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
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

// Database Tab
function DatabaseTab() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Database className="w-5 h-5 text-blue-600" />
        Database Management
      </h3>
      <div className="space-y-4">
        <DatabaseAction
          title="Backup Database"
          description="Create a full backup of all database tables"
          icon={Download}
          action="Backup Now"
          color="blue"
        />
        <DatabaseAction
          title="Restore Database"
          description="Restore database from a previous backup"
          icon={Upload}
          action="Restore"
          color="green"
        />
        <DatabaseAction
          title="Optimize Tables"
          description="Optimize database tables for better performance"
          icon={RefreshCw}
          action="Optimize"
          color="purple"
        />
        <DatabaseAction
          title="View Logs"
          description="View database query logs and performance metrics"
          icon={FileText}
          action="View Logs"
          color="orange"
        />
      </div>
    </div>
  )
}

function DatabaseAction({ title, description, icon: Icon, action, color }: { 
  title: string
  description: string
  icon: any
  action: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <button className={`px-4 py-2 ${colors[color]} text-white rounded-lg font-medium transition-colors`}>
        {action}
      </button>
    </div>
  )
}

// Security Tab
function SecurityTab({ currentUser }: { currentUser: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <SecuritySetting
            title="Two-Factor Authentication"
            description="Require 2FA for all admin accounts"
            enabled={false}
          />
          <SecuritySetting
            title="Password Requirements"
            description="Enforce strong password policies"
            enabled={true}
          />
          <SecuritySetting
            title="Session Timeout"
            description="Automatically log out inactive users"
            enabled={true}
          />
          <SecuritySetting
            title="IP Whitelist"
            description="Restrict access to specific IP addresses"
            enabled={false}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Security Alerts
        </h3>
        <div className="space-y-3">
          <SecurityAlert
            type="info"
            message="All systems operational"
            time="Just now"
          />
          <SecurityAlert
            type="warning"
            message="Failed login attempt detected"
            time="2 hours ago"
          />
        </div>
      </div>
    </div>
  )
}

function SecuritySetting({ title, description, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-600">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function SecurityAlert({ type, message, time }: { 
  type: 'info' | 'warning' | 'error'
  message: string
  time: string
}) {
  const typeColors = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  return (
    <div className={`p-4 rounded-lg border ${typeColors[type]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{message}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{time}</p>
        </div>
        {type === 'info' && <CheckCircle className="w-5 h-5 text-blue-600" />}
        {type === 'warning' && <AlertCircle className="w-5 h-5 text-orange-600" />}
        {type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
      </div>
    </div>
  )
}

// Email Queue Tab
function EmailQueueTab({ 
  emailQueue, 
  loadEmailQueue,
  emailWorkerRunning,
  startEmailWorker,
  stopEmailWorker
}: {
  emailQueue: EmailQueueItem[]
  loadEmailQueue: () => void
  emailWorkerRunning: boolean
  startEmailWorker: () => void
  stopEmailWorker: () => void
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredEmails = statusFilter === 'all' 
    ? emailQueue 
    : emailQueue.filter(e => e.status === statusFilter)

  const stats = {
    pending: emailQueue.filter(e => e.status === 'pending').length,
    sent: emailQueue.filter(e => e.status === 'sent').length,
    failed: emailQueue.filter(e => e.status === 'failed').length
  }

  return (
    <div className="space-y-6">
      {/* Email Worker Control */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email Worker Status
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {emailWorkerRunning ? 'Worker is running and processing emails' : 'Worker is stopped'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              emailWorkerRunning 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${emailWorkerRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-sm font-medium">
                {emailWorkerRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            {emailWorkerRunning ? (
              <button
                onClick={stopEmailWorker}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Stop Worker
              </button>
            ) : (
              <button
                onClick={startEmailWorker}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Worker
              </button>
            )}
            <button
              onClick={loadEmailQueue}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Sent</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{stats.sent}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Email Queue Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Email Queue</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Scheduled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{email.to}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white max-w-xs truncate">
                    {email.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EmailStatusBadge status={email.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {email.attempts} / {email.max_attempts}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(email.scheduled_for).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No emails in queue</p>
          </div>
        )}
      </div>
    </div>
  )
}

function EmailStatusBadge({ status }: { status: EmailQueueItem['status'] }) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', label: 'Pending' },
    sending: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', label: 'Sending' },
    sent: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', label: 'Sent' },
    failed: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', label: 'Failed' }
  }

  const config = statusConfig[status]
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

// Settings Tab
function SettingsTab({ currentUser }: { currentUser: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          General Settings
        </h3>
        <div className="space-y-4">
          <SettingRow
            label="Application Name"
            value="AccuCoder"
            type="text"
          />
          <SettingRow
            label="Support Email"
            value="support@accucoder.com"
            type="email"
          />
          <SettingRow
            label="Max Users"
            value="Unlimited"
            type="text"
          />
          <SettingRow
            label="Maintenance Mode"
            value="Off"
            type="toggle"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Email Settings
        </h3>
        <div className="space-y-4">
          <SettingRow
            label="SMTP Host"
            value="smtp.gmail.com"
            type="text"
          />
          <SettingRow
            label="SMTP Port"
            value="587"
            type="number"
          />
          <SettingRow
            label="Email Notifications"
            value="On"
            type="toggle"
          />
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, value, type }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-600">
      <span className="font-medium text-slate-900 dark:text-white">{label}</span>
      {type === 'toggle' ? (
        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-600">
          <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
        </button>
      ) : (
        <span className="text-slate-600 dark:text-slate-400">{value}</span>
      )}
    </div>
  )
}

// User Detail Modal
function UserDetailModal({ user, onClose, updateUserRole, deleteUser, currentUserRole, sendEmailToUser }: any) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">User Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Organization" value={user.organization || 'Not specified'} />
            <InfoField label="Position" value={user.position || 'Not specified'} />
            <InfoField label="AAPC ID" value={user.aapc_id || 'N/A'} />
            <InfoField label="AHIMA ID" value={user.ahima_id || 'N/A'} />
            <InfoField label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
            <InfoField label="Last Updated" value={new Date(user.updated_at).toLocaleDateString()} />
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
            {/* Send Email */}
            <div>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email to User
              </button>
              
              {showEmailForm && (
                <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Email Subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <textarea
                    placeholder="Email Message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (sendEmailToUser) {
                        sendEmailToUser(user.email, emailSubject, emailMessage)
                      }
                      setShowEmailForm(false)
                      setEmailSubject('')
                      setEmailMessage('')
                    }}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              )}
            </div>

            {currentUserRole === 'superadmin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Change Role
                  </label>
                  <select
                    defaultValue={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    deleteUser(user.id)
                    onClose()
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
