// CPT Code Data Structure
export interface CPTCode {
  code: string
  description: string
  category?: string
}

// Sample CPT codes (Common Procedural Terminology)
// Note: Full CPT codes are proprietary to AMA, these are for demonstration
export const sampleCPTCodes: CPTCode[] = [
  // Evaluation & Management
  { code: "99201", description: "Office visit, new patient, level 1", category: "E&M" },
  { code: "99202", description: "Office visit, new patient, level 2", category: "E&M" },
  { code: "99203", description: "Office visit, new patient, level 3", category: "E&M" },
  { code: "99204", description: "Office visit, new patient, level 4", category: "E&M" },
  { code: "99205", description: "Office visit, new patient, level 5", category: "E&M" },
  { code: "99211", description: "Office visit, established patient, minimal", category: "E&M" },
  { code: "99212", description: "Office visit, established patient, level 2", category: "E&M" },
  { code: "99213", description: "Office visit, established patient, level 3", category: "E&M" },
  { code: "99214", description: "Office visit, established patient, level 4", category: "E&M" },
  { code: "99215", description: "Office visit, established patient, level 5", category: "E&M" },
  { code: "99221", description: "Initial hospital care, level 1", category: "E&M" },
  { code: "99222", description: "Initial hospital care, level 2", category: "E&M" },
  { code: "99223", description: "Initial hospital care, level 3", category: "E&M" },
  { code: "99231", description: "Subsequent hospital care, level 1", category: "E&M" },
  { code: "99232", description: "Subsequent hospital care, level 2", category: "E&M" },
  { code: "99233", description: "Subsequent hospital care, level 3", category: "E&M" },
  { code: "99281", description: "Emergency department visit, level 1", category: "E&M" },
  { code: "99282", description: "Emergency department visit, level 2", category: "E&M" },
  { code: "99283", description: "Emergency department visit, level 3", category: "E&M" },
  { code: "99284", description: "Emergency department visit, level 4", category: "E&M" },
  { code: "99285", description: "Emergency department visit, level 5", category: "E&M" },
  
  // Surgery
  { code: "10060", description: "Incision and drainage of abscess", category: "Surgery" },
  { code: "11042", description: "Debridement, subcutaneous tissue", category: "Surgery" },
  { code: "12001", description: "Simple repair of superficial wounds, 2.5 cm or less", category: "Surgery" },
  { code: "20610", description: "Arthrocentesis, major joint", category: "Surgery" },
  
  // Radiology
  { code: "70450", description: "CT head/brain without contrast", category: "Radiology" },
  { code: "70486", description: "CT maxillofacial area without contrast", category: "Radiology" },
  { code: "71045", description: "Chest X-ray, single view", category: "Radiology" },
  { code: "71046", description: "Chest X-ray, 2 views", category: "Radiology" },
  { code: "72148", description: "MRI lumbar spine without contrast", category: "Radiology" },
  { code: "73030", description: "X-ray shoulder, minimum 2 views", category: "Radiology" },
  { code: "73610", description: "X-ray ankle, minimum 3 views", category: "Radiology" },
  { code: "74177", description: "CT abdomen and pelvis with contrast", category: "Radiology" },
  { code: "76700", description: "Ultrasound, abdominal, complete", category: "Radiology" },
  { code: "76805", description: "Ultrasound pregnant uterus, complete", category: "Radiology" },
  
  // Laboratory
  { code: "80053", description: "Comprehensive metabolic panel", category: "Laboratory" },
  { code: "80061", description: "Lipid panel", category: "Laboratory" },
  { code: "82947", description: "Glucose, blood quantitative", category: "Laboratory" },
  { code: "83036", description: "Hemoglobin A1C", category: "Laboratory" },
  { code: "84443", description: "TSH (thyroid stimulating hormone)", category: "Laboratory" },
  { code: "85025", description: "Complete blood count with differential", category: "Laboratory" },
  { code: "85610", description: "Prothrombin time", category: "Laboratory" },
  { code: "86900", description: "Blood typing, ABO", category: "Laboratory" },
  { code: "87070", description: "Culture, bacterial, any source", category: "Laboratory" },
  { code: "87086", description: "Urine culture", category: "Laboratory" },
  { code: "87186", description: "Bacterial susceptibility study", category: "Laboratory" },
  { code: "87880", description: "Strep test", category: "Laboratory" },
  
  // Medicine
  { code: "90471", description: "Immunization administration, first vaccine", category: "Medicine" },
  { code: "90472", description: "Immunization administration, each additional vaccine", category: "Medicine" },
  { code: "90658", description: "Influenza vaccine, split virus", category: "Medicine" },
  { code: "90716", description: "Varicella (chickenpox) vaccine", category: "Medicine" },
  { code: "93000", description: "Electrocardiogram, complete", category: "Medicine" },
  { code: "94060", description: "Spirometry", category: "Medicine" },
  { code: "96372", description: "Therapeutic/diagnostic injection, subcutaneous or intramuscular", category: "Medicine" },
]

// Search function for CPT codes
export function searchCPTCodes(query: string): CPTCode[] {
  if (!query || query.length < 2) return []
  
  const searchTerm = query.toLowerCase()
  
  return sampleCPTCodes.filter(code => 
    code.code.toLowerCase().includes(searchTerm) ||
    code.description.toLowerCase().includes(searchTerm)
  ).slice(0, 20) // Limit to 20 results
}

// Get code by exact match
export function getCPTCode(code: string): CPTCode | undefined {
  return sampleCPTCodes.find(c => c.code.toLowerCase() === code.toLowerCase())
}

// Get codes by category
export function getCPTCodesByCategory(category: string): CPTCode[] {
  return sampleCPTCodes.filter(code => code.category === category)
}

// Get random codes for placeholders
export function getRandomCPTCodes(count: number): CPTCode[] {
  const shuffled = [...sampleCPTCodes].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
