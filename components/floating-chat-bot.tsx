"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  imageUrl?: string
  imageCaption?: string
}

// Function to detect and format ICD/CPT codes in text
const formatMessageWithCodes = (text: string, onCodeClick: (code: string) => void) => {
  // Regex to match ICD-10 codes (e.g., E11.9, Z86.39, J18.9) and CPT codes (e.g., 99213, 99214)
  const codeRegex = /\b([A-Z]\d{2}\.?\d{0,4}|\d{5})\b/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before the code
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Add the clickable code
    const code = match[0]
    parts.push(
      <button
        key={`${match.index}-${code}`}
        onClick={() => onCodeClick(code)}
        className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/30 transition-colors underline cursor-pointer"
      >
        {code}
      </button>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return parts.length > 0 ? parts : text
}

export function FloatingChatBot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm AccuBot, your AI Medical Coding Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatboxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const savedMessages = sessionStorage.getItem('accubot-messages')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
  }, [])

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('accubot-messages', JSON.stringify(messages))
  }, [messages])

  // Handle code clicks - trigger search in navbar
  const handleCodeClick = (code: string) => {
    // Dispatch custom event to navbar
    const event = new CustomEvent('accubot-search', {
      detail: { searchTerm: code }
    })
    window.dispatchEvent(event)
    setIsOpen(false) // Close chatbot
  }

  // Calculate dynamic size based on message count
  const getchatboxSize = () => {
    const messageCount = messages.length
    
    if (messageCount <= 3) {
      return { width: '384px', height: '400px' } // w-96 = 384px
    } else if (messageCount <= 5) {
      return { width: '384px', height: '500px' }
    } else {
      return { width: '448px', height: '600px' } // w-112, max size
    }
  }

  const chatboxSize = getchatboxSize()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isOpen])

  // Auto-focus input when chatbox opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Keep input focused when messages change
  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus()
    }
  }, [messages, isOpen, isLoading])

  // Close chatbox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is outside both chatbox and button
      const isOutsideChatbox = chatboxRef.current && !chatboxRef.current.contains(target)
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(target)
      
      if (isOutsideChatbox && isOutsideButton) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Use timeout to avoid closing immediately after opening
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside)
      }, 0)
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Parse for image URLs in format: [IMAGE:url|caption]
        let responseText = data.response
        let imageUrl = ''
        let imageCaption = ''
        
        const imageMatch = responseText.match(/\[IMAGE:(https?:\/\/[^\|]+)\|([^\]]+)\]/)
        if (imageMatch) {
          imageUrl = imageMatch[1]
          imageCaption = imageMatch[2]
          responseText = responseText.replace(imageMatch[0], '').trim()
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: "bot",
          timestamp: new Date(),
          imageUrl: imageUrl || undefined,
          imageCaption: imageCaption || undefined,
        }
        setMessages((prev) => [...prev, botMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Error: ${data.error || 'Failed to get response. Please try again.'}`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting. Please check your internet connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <motion.button
        ref={buttonRef}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatboxRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: chatboxSize.width,
              height: chatboxSize.height
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-36 right-6 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50"
            style={{
              maxHeight: 'calc(100vh - 10rem)',
              minHeight: '400px',
              minWidth: '384px'
            }}
          >
            <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">AccuBot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 p-1 rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 scrollbar-hide">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-foreground rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.sender === "bot" 
                        ? formatMessageWithCodes(message.text, handleCodeClick)
                        : message.text
                      }
                    </p>
                    {message.imageUrl && (
                      <div className="mt-2 rounded overflow-hidden border border-border">
                        <img 
                          src={message.imageUrl} 
                          alt={message.imageCaption || "Medical illustration"}
                          className="w-full h-auto"
                          onError={(e) => {
                            // Hide image if it fails to load
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                        {message.imageCaption && (
                          <p className="text-xs p-2 bg-background/50 text-muted-foreground italic">
                            {message.imageCaption}
                          </p>
                        )}
                      </div>
                    )}
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary text-foreground px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4 bg-card rounded-b-2xl">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef as any}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
