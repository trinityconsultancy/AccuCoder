'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Loader2, ExternalLink } from 'lucide-react'
import { supabase, type AlphabeticalIndexRow } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function IndexPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<AlphabeticalIndexRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLetter, setActiveLetter] = useState<string>('A')

  // Get search param from URL (from AccuBot)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  const handleCodeClick = (code: string) => {
    if (code && code !== '-') {
      router.push(`/tabular?code=${code}`)
    }
  }

  const handleReferenceClick = (reference: string) => {
    if (reference) {
      setSearchTerm(reference)
      setActiveLetter('')
    }
  }

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const { data: rows, error } = await supabase
          .from('alphabetical_index')
          .select('*')
          .order('term', { ascending: true })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        setData(rows || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Group and filter data
  const { groupedData, filteredByLetter } = useMemo(() => {
    const getFirstLetter = (str: string): string => {
      const match = str.match(/[A-Za-z]/)
      return match ? match[0].toUpperCase() : ''
    }

    // Filter by search term
    let filtered = data
    if (searchTerm) {
      filtered = data.filter(row =>
        row.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.see_also?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort alphabetically
    filtered.sort((a, b) => {
      const aLetter = getFirstLetter(a.term)
      const bLetter = getFirstLetter(b.term)
      
      if (aLetter && bLetter) {
        return a.term.localeCompare(b.term, 'en', { sensitivity: 'base' })
      }
      if (!aLetter) return 1
      if (!bLetter) return -1
      return 0
    })

    // Group by first alphabetic letter
    const grouped = new Map<string, AlphabeticalIndexRow[]>()
    filtered.forEach(row => {
      const firstLetter = getFirstLetter(row.term)
      if (firstLetter) {
        if (!grouped.has(firstLetter)) {
          grouped.set(firstLetter, [])
        }
        grouped.get(firstLetter)!.push(row)
      }
    })

    // Filter by active letter
    const letterFiltered = activeLetter && grouped.has(activeLetter) 
      ? grouped.get(activeLetter)! 
      : Array.from(grouped.values()).flat()

    return { groupedData: grouped, filteredByLetter: letterFiltered }
  }, [data, searchTerm, activeLetter])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="min-h-screen bg-background pb-24 pt-16">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-secondary/20 to-background border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-10 bg-primary rounded-full"></div>
            <h1 className="text-3xl font-bold text-foreground">
              ICD-10-CM Alphabetical Index
            </h1>
          </div>
          <div className="ml-7 pl-4 border-l-2 border-primary/30">
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-4xl">
              External Cause of Injuries alphabetical index for quick code lookup. 
              Find ICD-10-CM codes for <span className="font-bold text-foreground">accidents</span>, 
              <span className="font-bold text-foreground"> transport incidents</span>, 
              <span className="font-bold text-foreground"> injuries</span>, and 
              <span className="font-bold text-foreground"> external causes</span>.
              Use cross-references to navigate related terms.
            </p>
          </div>
        </div>
      </div>

      {/* Top Search Bar */}
      <div className="bg-secondary/30 border-b-2 border-primary/20">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by term, code, or reference..."
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-md font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alphabet Navigation */}
      <div className="bg-secondary/20 border-b-2 border-border sticky top-[60px] z-[44] shadow-sm backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveLetter('')}
              className={`px-3 py-1 text-sm font-medium transition-all rounded ${
                !activeLetter
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              All
            </button>
            <div className="flex items-center justify-between gap-0.5 flex-1">
              {alphabet.map(letter => {
                const hasData = groupedData.has(letter)
                const isActive = activeLetter === letter
                return (
                  <button
                    key={letter}
                    onClick={() => hasData && setActiveLetter(letter)}
                    disabled={!hasData}
                    className={`flex-1 px-2 py-1 text-sm font-medium transition-all ${
                      hasData
                        ? isActive
                          ? 'bg-primary text-primary-foreground underline'
                          : 'text-primary hover:bg-primary/10'
                        : 'text-muted-foreground/30 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-0">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive mt-4">
            <p className="font-semibold">Error loading data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Table Header - Sticky */}
        {!loading && !error && (
          <div className="bg-background border-b-2 border-border sticky top-[104px] z-[43] shadow-sm">
            <div className="grid grid-cols-3 gap-0 text-xs font-semibold text-foreground uppercase tracking-wide">
              <div className="px-4 py-3 border-r border-border bg-background">Term</div>
              <div className="px-4 py-3 border-r border-border bg-background">ICD-10-CM Code</div>
              <div className="px-4 py-3 bg-background">Cross-Reference</div>
            </div>
          </div>
        )}

        {/* Letter Section Title */}
        {!loading && !error && activeLetter && (
          <div className="bg-background border-b border-border py-2 px-4">
            <span className="text-lg font-bold text-primary">{activeLetter}</span>
          </div>
        )}

        {/* Table Data */}
        {!loading && !error && (
          <div className="bg-background">
            {filteredByLetter.map((row, index) => {
              const indentClass = row.indent_level > 0 
                ? `pl-${Math.min(row.indent_level * 2, 12)}` 
                : ''
              
              return (
                <div
                  key={row.id}
                  className={`grid grid-cols-3 gap-0 text-sm border-b border-border hover:bg-secondary/20 transition-colors ${
                    index === 0 ? 'bg-secondary/10' : ''
                  }`}
                >
                  {/* Term */}
                  <div className={`px-4 py-2.5 text-foreground border-r border-border ${indentClass}`}>
                    {row.term}
                  </div>

                  {/* Code */}
                  <div className="px-4 py-2.5 border-r border-border">
                    {row.code ? (
                      <button
                        onClick={() => handleCodeClick(row.code!)}
                        className="text-primary font-mono text-xs hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                      >
                        {row.code}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* Cross-Reference */}
                  <div className="px-4 py-2.5 text-muted-foreground">
                    {row.reference && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs italic">see:</span>
                        <button
                          onClick={() => handleReferenceClick(row.reference!)}
                          className="text-primary hover:underline flex items-center gap-1 text-xs"
                        >
                          {row.reference}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {row.see_also && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs italic">see also:</span>
                        <button
                          onClick={() => handleReferenceClick(row.see_also!)}
                          className="text-primary hover:underline flex items-center gap-1 text-xs"
                        >
                          {row.see_also}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {!row.reference && !row.see_also && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredByLetter.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No results found for "${searchTerm}"` 
                : activeLetter 
                  ? `No entries found for letter "${activeLetter}"` 
                  : 'No entries available'}
            </p>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && filteredByLetter.length > 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Showing {filteredByLetter.length} {filteredByLetter.length === 1 ? 'entry' : 'entries'}
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  )
}

