'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to index page (alphabetical index)
    router.push('/index')
  }, [router])
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading AccuCoder...</p>
      </div>
    </div>
  )
}
