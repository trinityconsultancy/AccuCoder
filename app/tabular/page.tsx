'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function TabularContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      <div className="max-w-[1800px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ICD-10-CM Tabular List
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed code information and hierarchical structure
          </p>
        </div>

        {/* Code Info */}
        {code ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="mb-4">
              <span className="text-lg font-semibold text-foreground">Code: </span>
              <span className="text-2xl font-bold text-primary font-mono">{code}</span>
            </div>
            <p className="text-muted-foreground mb-2">
              No data available for this code right now
            </p>
            <p className="text-sm text-muted-foreground">
              The tabular list feature is coming soon. This will show detailed information, 
              code hierarchy, includes/excludes notes, and related codes.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Select a code from the Drugs & Chemicals table to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TabularPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pb-24 pt-16 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <TabularContent />
    </Suspense>
  )
}
