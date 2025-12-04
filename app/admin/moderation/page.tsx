// Admin Review Moderation Page
// /admin/moderation - Review moderation queue

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Review {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  drugName: string
  rating: number
  reviewText: string
  sideEffects?: string[]
  effectiveness?: string
  createdAt: string
}

interface ModerationResult {
  reviews: Review[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ModerationPage() {
  const [data, setData] = useState<ModerationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set())
  const [moderatorNotes, setModeratorNotes] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPendingReviews = async (pageNum: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/reviews/pending?page=${pageNum}&limit=20`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Failed to fetch reviews')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingReviews(page)
  }, [page])

  const handleSelectReview = (reviewId: string) => {
    const newSelected = new Set(selectedReviews)
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId)
    } else {
      newSelected.add(reviewId)
    }
    setSelectedReviews(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedReviews.size === data?.reviews.length) {
      setSelectedReviews(new Set())
    } else {
      setSelectedReviews(new Set(data?.reviews.map(r => r._id) || []))
    }
  }

  const handleModerateReview = async (reviewId: string, action: 'approve' | 'reject') => {
    setActionLoading(true)
    
    try {
      const response = await fetch('/api/admin/reviews/moderate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reviewId,
          action,
          moderatorNotes: moderatorNotes[reviewId] || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Moderation failed')
      }

      // Refresh list
      await fetchPendingReviews(page)
      
      // Clear notes
      const newNotes = { ...moderatorNotes }
      delete newNotes[reviewId]
      setModeratorNotes(newNotes)
      
      // Remove from selection
      const newSelected = new Set(selectedReviews)
      newSelected.delete(reviewId)
      setSelectedReviews(newSelected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBatchModerate = async (action: 'approve' | 'reject') => {
    if (selectedReviews.size === 0) return
    
    setActionLoading(true)
    
    try {
      const response = await fetch('/api/admin/reviews/moderate/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reviewIds: Array.from(selectedReviews),
          action,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || 'Batch moderation failed')
      }

      // Refresh list
      await fetchPendingReviews(page)
      
      // Clear selection
      setSelectedReviews(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Review Moderation</h1>
          <p className="text-muted-foreground">
            {data?.total || 0} pending reviews
          </p>
        </div>
        {selectedReviews.size > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleBatchModerate('approve')}
              disabled={actionLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected ({selectedReviews.size})
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBatchModerate('reject')}
              disabled={actionLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Selected ({selectedReviews.size})
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Select All */}
      {data && data.reviews.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedReviews.size === data.reviews.length}
            onChange={handleSelectAll}
            className="h-4 w-4"
          />
          <label className="text-sm">Select All</label>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {data?.reviews.map((review) => (
          <Card key={review._id} className={selectedReviews.has(review._id) ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedReviews.has(review._id)}
                    onChange={() => handleSelectReview(review._id)}
                    className="h-4 w-4 mt-1"
                  />
                  <div>
                    <CardTitle className="text-lg">{review.drugName}</CardTitle>
                    <CardDescription>
                      By {review.userId.firstName} {review.userId.lastName} ({review.userId.email})
                      <br />
                      {new Date(review.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Review</h4>
                <p className="text-sm">{review.reviewText}</p>
              </div>

              {review.sideEffects && review.sideEffects.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Side Effects</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.sideEffects.map((effect, idx) => (
                      <Badge key={idx} variant="secondary">{effect}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {review.effectiveness && (
                <div>
                  <h4 className="font-semibold mb-2">Effectiveness</h4>
                  <Badge>{review.effectiveness}</Badge>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Moderator Notes (Optional)</h4>
                <Textarea
                  value={moderatorNotes[review._id] || ''}
                  onChange={(e) => setModeratorNotes({ ...moderatorNotes, [review._id]: e.target.value })}
                  placeholder="Add notes for this moderation action..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleModerateReview(review._id, 'reject')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleModerateReview(review._id, 'approve')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {data && data.reviews.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold">All reviews moderated!</p>
              <p className="text-muted-foreground">No pending reviews at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(page + 1)}
            disabled={page === data.totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
