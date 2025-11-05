import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
