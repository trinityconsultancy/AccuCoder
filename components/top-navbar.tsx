"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Search, User, NotepadText, BookOpen, ChevronDown } from "lucide-react"
import { NotesDropdown } from "./notes-modal"

export function TopNavbar() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const [booksOpen, setBooksOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const notesButtonRef = useRef<HTMLButtonElement>(null)
  const booksButtonRef = useRef<HTMLButtonElement>(null)
  const booksDropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const placeholders = [
    "Search ICD-10: J18.9 - Pneumonia, unspecified...",
    "Search CPT: 99213 - Office visit, established patient...",
    "Search condition: Type 2 Diabetes Mellitus...",
    "Search ICD-10: I10 - Essential hypertension...",
    "Search CPT: 99283 - Emergency dept visit...",
    "Search ICD-10: E11.9 - Type 2 diabetes without complications...",
    "Search CPT: 93000 - Electrocardiogram, routine ECG...",
    "Search condition: Acute bronchitis...",
    "Search ICD-10: M54.5 - Low back pain...",
    "Search CPT: 80053 - Comprehensive metabolic panel...",
    "Search ICD-10: F41.1 - Generalized anxiety disorder...",
    "Search CPT: 36415 - Routine venipuncture...",
    "Search condition: Chronic obstructive pulmonary disease...",
    "Search ICD-10: K21.9 - Gastroesophageal reflux disease...",
    "Search CPT: 70450 - CT head/brain without contrast...",
  ]

  useEffect(() => {
    if (hasSearched) return // Stop cycling if user has searched
    
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [hasSearched])

  // Listen for search events from AccuBot
  useEffect(() => {
    const handleSearchFromBot = (event: CustomEvent) => {
      const searchTerm = event.detail.searchTerm
      setSearchValue(searchTerm)
      setHasSearched(true)
      // Focus the search input
      searchInputRef.current?.focus()
      // Optionally select all text
      searchInputRef.current?.select()
    }

    window.addEventListener('accubot-search' as any, handleSearchFromBot as any)
    return () => {
      window.removeEventListener('accubot-search' as any, handleSearchFromBot as any)
    }
  }, [])

  // Keyboard shortcut for search (just "/" key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is not already typing in an input/textarea
      const target = e.target as HTMLElement
      const isTyping = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable
      
      if (e.key === "/" && !isTyping) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // Also support Escape to blur the search
      if (e.key === "Escape" && target === searchInputRef.current) {
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Close books dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      const isOutsideDropdown = booksDropdownRef.current && !booksDropdownRef.current.contains(target)
      const isOutsideButton = booksButtonRef.current && !booksButtonRef.current.contains(target)
      
      if (isOutsideDropdown && isOutsideButton) {
        setTimeout(() => {
          setBooksOpen(false)
        }, 0)
      }
    }

    if (booksOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [booksOpen])

  return (
    <nav className="sticky top-0 z-50 bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/95 border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto px-8 py-3.5">
        <div className="flex items-center justify-between gap-8">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <img src="/images/design-mode/AccuCoder.png" alt="AccuCoder" className="h-9 w-auto" />
            </motion.div>
          </Link>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <div className="flex items-center bg-secondary/40 border-2 border-border hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-lg transition-all shadow-sm">
                <div className="flex-1 flex items-center px-3.5 py-2">
                  <Search className="w-4 h-4 text-foreground/40 mr-2 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value)
                      if (e.target.value.length > 0) {
                        setHasSearched(true)
                      }
                    }}
                    className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-foreground/40 transition-all duration-300"
                    placeholder={hasSearched ? "Search..." : placeholders[placeholderIndex]}
                    key={hasSearched ? "static" : placeholderIndex}
                    style={{
                      animation: hasSearched ? 'none' : 'fadeIn 0.5s ease-in-out'
                    }}
                  />
                  <style jsx>{`
                    @keyframes fadeIn {
                      0% { opacity: 0.3; }
                      100% { opacity: 1; }
                    }
                  `}</style>
                </div>
                {/* Keyboard Shortcut Hint */}
                <div className="pr-3 flex items-center text-xs text-foreground/30 select-none">
                  <kbd className="px-2 py-0.5 bg-background/60 border border-border rounded text-[11px] font-mono">/</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Navigation Links & Actions */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Books Dropdown */}
            <div className="relative">
              <button
                ref={booksButtonRef}
                onClick={() => setBooksOpen(!booksOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                {/* ICD Book Badge */}
                <div className="px-2 py-0.5 bg-secondary/40 border border-border rounded text-xs font-bold text-foreground/70">
                  ICD
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${booksOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {booksOpen && (
                  <motion.div
                    ref={booksDropdownRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-2">
                      <Link
                        href="/index"
                        onClick={() => setBooksOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        Alphabetical Index
                      </Link>
                      <Link
                        href="/tabular"
                        onClick={() => setBooksOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        Tabular List
                      </Link>
                      <Link
                        href="/table/drugs"
                        onClick={() => setBooksOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        Drug & Chemicals
                      </Link>
                      <Link
                        href="/table/neoplasm"
                        onClick={() => setBooksOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        Table of Neoplasm
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Action Icons */}
            <div className="flex items-center gap-2">
              {/* Notes Icon */}
              <div className="relative">
                <button
                  ref={notesButtonRef}
                  onClick={() => setNotesOpen(!notesOpen)}
                  className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary/60 rounded-lg transition-all"
                  title="Quick Notes"
                  aria-label="Quick Notes"
                >
                  <NotepadText className="w-5 h-5" />
                </button>
                <NotesDropdown isOpen={notesOpen} onClose={() => setNotesOpen(false)} buttonRef={notesButtonRef} />
              </div>

              {/* Profile Icon */}
              <button 
                className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary/60 rounded-lg transition-all"
                title="User Profile"
                aria-label="User Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
