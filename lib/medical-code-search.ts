import { searchICD10Codes, getICD10Code, ICD10Code } from './icd10-data'
import { searchCPTCodes, getCPTCode, CPTCode } from './cpt-data'

export type MedicalCode = (ICD10Code | CPTCode) & {
  type: 'ICD10' | 'CPT'
}

// Unified search across both ICD-10 and CPT codes
export function searchMedicalCodes(query: string): MedicalCode[] {
  const icd10Results = searchICD10Codes(query).map(code => ({
    ...code,
    type: 'ICD10' as const
  }))
  
  const cptResults = searchCPTCodes(query).map(code => ({
    ...code,
    type: 'CPT' as const
  }))
  
  // Combine and sort by relevance (exact code matches first, then description matches)
  const allResults = [...icd10Results, ...cptResults]
  
  return allResults.sort((a, b) => {
    const queryLower = query.toLowerCase()
    const aCodeMatch = a.code.toLowerCase() === queryLower
    const bCodeMatch = b.code.toLowerCase() === queryLower
    
    if (aCodeMatch && !bCodeMatch) return -1
    if (!aCodeMatch && bCodeMatch) return 1
    
    const aCodeStartsWith = a.code.toLowerCase().startsWith(queryLower)
    const bCodeStartsWith = b.code.toLowerCase().startsWith(queryLower)
    
    if (aCodeStartsWith && !bCodeStartsWith) return -1
    if (!aCodeStartsWith && bCodeStartsWith) return 1
    
    return 0
  }).slice(0, 20)
}

// Get specific code by code number (checks both ICD-10 and CPT)
export function getMedicalCode(code: string): MedicalCode | undefined {
  const icd10 = getICD10Code(code)
  if (icd10) {
    return { ...icd10, type: 'ICD10' }
  }
  
  const cpt = getCPTCode(code)
  if (cpt) {
    return { ...cpt, type: 'CPT' }
  }
  
  return undefined
}

// Format code for display
export function formatMedicalCode(code: MedicalCode): string {
  return `${code.type === 'ICD10' ? 'ICD-10' : 'CPT'}: ${code.code} - ${code.description}`
}
