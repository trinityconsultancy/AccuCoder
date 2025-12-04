// Admin Dashboard Page
// /admin - Analytics dashboard with metrics and moderation queue

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  Star, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface DashboardSummary {
  users: {
    total: number
    active: number
    newToday: number
    newThisWeek: number
    newThisMonth: number
    byRole: { student: number; professional: number; admin: number }
    verificationRate: number
  }
  reviews: {
    total: number
    pending: number
    approved: number
    rejected: number
    averageRating: number
    todaySubmissions: number
    approvalRate: number
    byRating: Record<number, number>
  }
  apiUsage: {
    totalRequests: number
    requestsByEndpoint: Record<string, number>
    averageResponseTime: number
    errorRate: number
    cacheHitRate: number
  }
  system: {
    databaseSize: number
    activeConnections: number
    memoryUsage: {
      heapUsed: number
      heapTotal: number
      external: number
    }
    uptime: number
  }
  engagement: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    averageSessionDuration: number
  }
  timestamp: string
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to fetch dashboard data')
      }

      const data = await response.json()
      setSummary(data.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (loading && !summary) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {lastRefresh.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/moderation">
            <Button variant="outline">
              Moderate Reviews
            </Button>
          </Link>
          <Button onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.users.total)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.users.newToday} new today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.reviews.total)}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.reviews.pending} pending moderation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.reviews.averageRating.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.reviews.approvalRate.toFixed(1)}% approval rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(summary.engagement.dailyActiveUsers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Daily active users
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Review Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.reviews.pending)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Reviews</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.reviews.approved)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Reviews</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.reviews.rejected)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Today</span>
                  <span className="font-semibold">{summary.users.newToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Week</span>
                  <span className="font-semibold">{summary.users.newThisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month</span>
                  <span className="font-semibold">{summary.users.newThisMonth}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Students</span>
                  <span className="font-semibold">{formatNumber(summary.users.byRole.student)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Professionals</span>
                  <span className="font-semibold">{formatNumber(summary.users.byRole.professional)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Admins</span>
                  <span className="font-semibold">{formatNumber(summary.users.byRole.admin)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Daily Active</span>
                  <span className="font-semibold">{formatNumber(summary.engagement.dailyActiveUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekly Active</span>
                  <span className="font-semibold">{formatNumber(summary.engagement.weeklyActiveUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Active</span>
                  <span className="font-semibold">{formatNumber(summary.engagement.monthlyActiveUsers)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Reviews</span>
                  <span className="font-semibold">{formatNumber(summary.reviews.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Rating</span>
                  <span className="font-semibold">{summary.reviews.averageRating.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Approval Rate</span>
                  <span className="font-semibold">{summary.reviews.approvalRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Today's Submissions</span>
                  <span className="font-semibold">{summary.reviews.todaySubmissions}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex justify-between items-center">
                    <span className="text-sm flex items-center">
                      {rating} <Star className="h-3 w-3 ml-1 fill-current text-yellow-500" />
                    </span>
                    <span className="font-semibold">
                      {formatNumber(summary.reviews.byRating[rating] || 0)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Database Size</span>
                  <span className="font-semibold">{formatBytes(summary.system.databaseSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Connections</span>
                  <span className="font-semibold">{summary.system.activeConnections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-semibold">{formatDuration(summary.system.uptime)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Heap Used</span>
                  <span className="font-semibold">{formatBytes(summary.system.memoryUsage.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Heap Total</span>
                  <span className="font-semibold">{formatBytes(summary.system.memoryUsage.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">External</span>
                  <span className="font-semibold">{formatBytes(summary.system.memoryUsage.external)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
