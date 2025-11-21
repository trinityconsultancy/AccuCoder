'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardPage() {
  const [searchValue, setSearchValue] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [searchedTerm, setSearchedTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const placeholders = [
    "Search ICD-10: J18.9 - Pneumonia, unspecified...",
    "Search CPT: 99213 - Office visit, established patient...",
    "Search condition: Type 2 Diabetes Mellitus...",
    "Search ICD-10: I10 - Essential hypertension...",
    "Search CPT: 99283 - Emergency dept visit...",
    "Search ICD-10: E11.9 - Type 2 diabetes without complications...",
  ]



  // Cycle through placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Focus search on "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
      
      if (e.key === "/" && !isTyping) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchedTerm(searchValue)
    setShowResults(true)
    // Always move search to navbar, even if searchValue is empty or no results
    window.dispatchEvent(new CustomEvent('dashboard-search', { 
      detail: { searchTerm: searchValue } 
    }))
  }

  const handleBackToSearch = () => {
    setShowResults(false)
    setSearchValue('')
    setSearchedTerm('')
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Centered search bar only before search */}
      {!showResults && (
        <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-140px)]">
          <div className="w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Logo */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 12 }}
                    className="text-center"
                  >
                    <Image 
                      src="/images/design-mode/AccuCoder.png" 
                      alt="AccuCoder" 
                      width={238}
                      height={61}
                      className="h-14 w-auto mx-auto"
                    />
                    <div className="mt-3 text-lg text-muted-foreground font-medium">
                      Instantly search ICD-10, CPT, and medical codes. Start typing to find any code or condition.
                    </div>
                  </motion.div>

                  {/* Centered Search Bar - 15% smaller */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="max-w-[42rem] mx-auto"
                  >
                    <motion.form
                      onSubmit={handleSearch}
                      className="relative"
                    >
                      <div className="relative group">
                        <motion.div 
                          className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{
                            backgroundSize: '200% 200%'
                          }}
                        />
                        <div className="relative flex items-center bg-background border-2 border-border hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 rounded-2xl transition-all shadow-2xl">
                          <div className="flex-1 flex items-center px-6 py-5">
                            <Search className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                              className="w-full bg-transparent border-none text-lg focus:outline-none placeholder-muted-foreground/60 transition-all"
                              placeholder={placeholders[placeholderIndex]}
                              key={placeholderIndex}
                              style={{ animation: 'fadeIn 0.5s ease-in-out' }}
                            />
                            <style jsx>{`
                              @keyframes fadeIn {
                                0% { opacity: 0.3; }
                                100% { opacity: 1; }
                              }
                            `}</style>
                          </div>
                          <div className="pr-4 flex items-center gap-3">
                            <kbd className="hidden sm:flex px-2.5 py-1.5 bg-secondary/60 border border-border rounded-lg text-sm font-mono text-muted-foreground items-center gap-1">
                              <span className="text-xs">Press</span> /
                            </kbd>
                            <button
                              type="submit"
                              className="px-7 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                            >
                              Search
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Search Suggestions Placeholder */}
                      {searchValue && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        >
                          {/* Search suggestions will be rendered here */}
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Start typing to see suggestions...
                          </div>
                        </motion.div>
                      )}
                    </motion.form>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Results state (centered) - only after search */}
      {showResults && (
        <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-140px)]">
          <div className="w-full max-w-5xl">
            <AnimatePresence mode="wait">
              <motion.div
                key="no-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center"
                >
                  <Search className="w-12 h-12 text-orange-500" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">No Results Found</h2>
                  <p className="text-muted-foreground">
                    No search results found for <span className="font-semibold text-foreground">"{searchedTerm}"</span>
                  </p>
                </div>
                <button
                  onClick={handleBackToSearch}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  Try Another Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
