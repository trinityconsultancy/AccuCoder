import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Using placeholder values.')
  console.warn('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables.')
}

// Create Supabase client with custom storage that respects Remember Me preference
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'accucoder-auth',
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        // Check if user wants to be remembered
        const rememberMe = localStorage.getItem('accucoder_remember_me')
        if (rememberMe === 'true') {
          // Use localStorage for persistent session
          return localStorage.getItem(key)
        } else {
          // Use sessionStorage for session-only persistence
          return sessionStorage.getItem(key)
        }
      },
      setItem: (key: string, value: string) => {
        // Check if user wants to be remembered
        const rememberMe = localStorage.getItem('accucoder_remember_me')
        if (rememberMe === 'true') {
          // Store in localStorage for persistence
          localStorage.setItem(key, value)
        } else {
          // Store in sessionStorage (clears on browser close)
          sessionStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        // Remove from both storages to be safe
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      },
    } : undefined,
  },
})

// Types for the database
export interface DrugChemicalRow {
  id: number
  substance: string
  poisoning_accidental_unintentional: string | null
  poisoning_intentional_self_harm: string | null
  poisoning_assault: string | null
  poisoning_undetermined: string | null
  adverse_effect: string | null
  underdosing: string | null
  created_at?: string
  updated_at?: string
}

export interface UserReview {
  id: string
  name: string
  email: string
  role: string
  location: string
  country: string
  rating: number
  comment: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface AlphabeticalIndexRow {
  id: number
  term: string
  code: string | null
  reference: string | null
  see_also: string | null
  type: string
  indent_level: number
  created_at?: string
  updated_at?: string
}
