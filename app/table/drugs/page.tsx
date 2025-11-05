'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Loader2, ChevronDown } from 'lucide-react'
import { supabase, type DrugChemicalRow } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DrugsTablePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<DrugChemicalRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLetter, setActiveLetter] = useState<string>('')

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

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const { data: rows, error, count } = await supabase
          .from('drugs_and_chemicals')
          .select('*', { count: 'exact' })
          .order('substance', { ascending: true })

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
    // Helper function to get the first alphabetic character
    const getFirstLetter = (str: string): string => {
      const match = str.match(/[A-Za-z]/)
      return match ? match[0].toUpperCase() : ''
    }

    // Filter by search term
    let filtered = data
    if (searchTerm) {
      filtered = data.filter(row =>
        row.substance.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.poisoning_accidental_unintentional?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.poisoning_intentional_self_harm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.poisoning_assault?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.poisoning_undetermined?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.adverse_effect?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.underdosing?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort alphabetically, ignoring special characters
    filtered.sort((a, b) => {
      const aLetter = getFirstLetter(a.substance)
      const bLetter = getFirstLetter(b.substance)
      
      // If both start with letters, sort by the full substance name
      if (aLetter && bLetter) {
        return a.substance.localeCompare(b.substance, 'en', { sensitivity: 'base' })
      }
      // Items without letters go to the end
      if (!aLetter) return 1
      if (!bLetter) return -1
      return 0
    })

    // Group by first alphabetic letter
    const grouped = new Map<string, DrugChemicalRow[]>()
    filtered.forEach(row => {
      const firstLetter = getFirstLetter(row.substance)
      if (firstLetter) {
        if (!grouped.has(firstLetter)) {
          grouped.set(firstLetter, [])
        }
        grouped.get(firstLetter)!.push(row)
      }
    })

    // Filter by active letter - show all if no letter selected
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
              Table of Drugs and Chemicals
            </h1>
          </div>
          <div className="ml-7 pl-4 border-l-2 border-primary/30">
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-4xl">
              Comprehensive ICD-10-CM coding reference for poisoning by drugs, medicaments and biological substances. 
              Includes codes for <span className="font-bold text-foreground">accidental poisoning</span>, 
              <span className="font-bold text-foreground"> intentional self-harm</span>, 
              <span className="font-bold text-foreground"> assault</span>, 
              <span className="font-bold text-foreground"> undetermined intent</span>, 
              <span className="font-bold text-foreground"> adverse effects</span>, and 
              <span className="font-bold text-foreground"> underdosing</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Top Search Bar */}
      <div className="bg-secondary/30 border-b-2 border-primary/20">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            {/* Search Input */}
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by substance name or ICD-10 code..."
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-md font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alphabet Navigation - Episource Style */}
      <div className="bg-secondary/20 border-b-2 border-border sticky top-[60px] z-[44] shadow-sm backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-0.5">
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
          <div className="bg-background border-b border-border sticky top-[104px] z-[43] shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-7 gap-0 text-xs font-semibold text-foreground uppercase tracking-wide">
              <div className="px-4 py-2 border-r border-border bg-background">ICD-10-CM Table of Drugs & Chemicals</div>
              <div className="px-4 py-2 text-center border-r border-border bg-background">Poisoning Accidental</div>
              <div className="px-4 py-2 text-center border-r border-border bg-background">Poisoning Intentional</div>
              <div className="px-4 py-2 text-center border-r border-border bg-background">Poisoning Assault</div>
              <div className="px-4 py-2 text-center border-r border-border bg-background">Poisoning Undetermined</div>
              <div className="px-4 py-2 text-center border-r border-border bg-background">Adverse Effect</div>
              <div className="px-4 py-2 text-center bg-background">Underdosing</div>
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
            {filteredByLetter.map((row, index) => (
              <div
                key={row.id}
                className={`grid grid-cols-7 gap-0 text-sm border-b border-border hover:bg-secondary/20 transition-colors ${
                  index === 0 ? 'bg-secondary/10' : ''
                }`}
              >
                <div className="px-4 py-2.5 text-foreground border-r border-border">{row.substance}</div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs border-r border-border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.poisoning_accidental_unintentional || '')}
                >
                  {row.poisoning_accidental_unintentional || '-'}
                </div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs border-r border-border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.poisoning_intentional_self_harm || '')}
                >
                  {row.poisoning_intentional_self_harm || '-'}
                </div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs border-r border-border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.poisoning_assault || '')}
                >
                  {row.poisoning_assault || '-'}
                </div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs border-r border-border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.poisoning_undetermined || '')}
                >
                  {row.poisoning_undetermined || '-'}
                </div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs border-r border-border cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.adverse_effect || '')}
                >
                  {row.adverse_effect || '-'}
                </div>
                <div 
                  className="px-4 py-2.5 text-center text-primary font-mono text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleCodeClick(row.underdosing || '')}
                >
                  {row.underdosing || '-'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredByLetter.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `No results found for "${searchTerm}"` : 'Select a letter to view entries'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
