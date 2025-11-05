"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Copy, Check } from "lucide-react"

interface Note {
  id: string
  content: string
  createdAt: string
}

interface NotesDropdownProps {
  isOpen: boolean
  onClose: () => void
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

export function NotesDropdown({ isOpen, onClose, buttonRef }: NotesDropdownProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("accucoder-notes")
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error("Failed to load notes:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save notes to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("accucoder-notes", JSON.stringify(notes))
    }
  }, [notes, isLoading])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, buttonRef])

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date().toLocaleString(),
      }
      setNotes([note, ...notes])
      setNewNote("")
    }
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const copyNote = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${dateStr} ${timeStr}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-[1px] w-80 bg-background border border-border rounded-lg shadow-xl z-50 flex flex-col max-h-96"
          style={{ transformOrigin: 'top center' }}
        >
          {/* Header */}
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Quick Notes</h3>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {notes.length === 0 ? (
              <p className="text-xs text-foreground/50 text-center py-4">No notes yet</p>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-secondary/30 hover:bg-secondary/50 border border-border/50 rounded-md p-2 group transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground break-words leading-relaxed mb-1">{note.content}</p>
                      <span className="text-[10px] text-foreground/40">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => copyNote(note.content, note.id)}
                        className="p-0.5 text-foreground/40 hover:text-primary hover:bg-primary/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Copy note"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-0.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Input Section */}
          <div className="border-t border-border p-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  addNote()
                }
              }}
              placeholder="Type your note..."
              className="w-full bg-secondary/50 border border-border rounded-md p-2.5 text-xs text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
            <p className="text-[10px] text-foreground/40 mt-1.5 text-center">
              Press <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[9px] font-mono">Enter</kbd> to save • <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
