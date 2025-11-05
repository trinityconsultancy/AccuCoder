// ICD-10-CM Code Data Structure
export interface ICD10Code {
  code: string
  description: string
  category?: string
  billable?: boolean
}

// Sample ICD-10-CM codes from CMS data
// In production, this would be loaded from the official CMS dataset
export const sampleICD10Codes: ICD10Code[] = [
  // Infectious Diseases (A00-B99)
  { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified", category: "Infectious", billable: true },
  { code: "A41.9", description: "Sepsis, unspecified organism", category: "Infectious", billable: true },
  { code: "B34.9", description: "Viral infection, unspecified", category: "Infectious", billable: true },
  
  // Neoplasms (C00-D49)
  { code: "C50.911", description: "Malignant neoplasm of unspecified site of right female breast", category: "Neoplasm", billable: true },
  { code: "D12.0", description: "Benign neoplasm of cecum", category: "Neoplasm", billable: true },
  
  // Endocrine/Metabolic (E00-E89)
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine", billable: true },
  { code: "E66.9", description: "Obesity, unspecified", category: "Endocrine", billable: true },
  { code: "E78.5", description: "Hyperlipidemia, unspecified", category: "Endocrine", billable: true },
  { code: "E87.6", description: "Hypokalemia", category: "Endocrine", billable: true },
  
  // Mental/Behavioral (F01-F99)
  { code: "F10.20", description: "Alcohol dependence, uncomplicated", category: "Mental", billable: true },
  { code: "F17.210", description: "Nicotine dependence, cigarettes, uncomplicated", category: "Mental", billable: true },
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified", category: "Mental", billable: true },
  { code: "F41.9", description: "Anxiety disorder, unspecified", category: "Mental", billable: true },
  
  // Nervous System (G00-G99)
  { code: "G43.909", description: "Migraine, unspecified, not intractable, without status migrainosus", category: "Nervous", billable: true },
  { code: "G89.29", description: "Other chronic pain", category: "Nervous", billable: true },
  
  // Circulatory (I00-I99)
  { code: "I10", description: "Essential (primary) hypertension", category: "Circulatory", billable: true },
  { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina pectoris", category: "Circulatory", billable: true },
  { code: "I48.91", description: "Unspecified atrial fibrillation", category: "Circulatory", billable: true },
  { code: "I50.9", description: "Heart failure, unspecified", category: "Circulatory", billable: true },
  
  // Respiratory (J00-J99)
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Respiratory", billable: true },
  { code: "J18.9", description: "Pneumonia, unspecified organism", category: "Respiratory", billable: true },
  { code: "J44.1", description: "Chronic obstructive pulmonary disease with (acute) exacerbation", category: "Respiratory", billable: true },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated", category: "Respiratory", billable: true },
  
  // Digestive (K00-K95)
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis", category: "Digestive", billable: true },
  { code: "K29.70", description: "Gastritis, unspecified, without bleeding", category: "Digestive", billable: true },
  { code: "K57.30", description: "Diverticulosis of large intestine without perforation or abscess without bleeding", category: "Digestive", billable: true },
  { code: "K80.20", description: "Calculus of gallbladder without cholecystitis without obstruction", category: "Digestive", billable: true },
  
  // Musculoskeletal (M00-M99)
  { code: "M25.511", description: "Pain in right shoulder", category: "Musculoskeletal", billable: true },
  { code: "M54.5", description: "Low back pain", category: "Musculoskeletal", billable: true },
  { code: "M79.3", description: "Panniculitis, unspecified", category: "Musculoskeletal", billable: true },
  { code: "M81.0", description: "Age-related osteoporosis without current pathological fracture", category: "Musculoskeletal", billable: true },
  
  // Genitourinary (N00-N99)
  { code: "N18.3", description: "Chronic kidney disease, stage 3 (moderate)", category: "Genitourinary", billable: true },
  { code: "N39.0", description: "Urinary tract infection, site not specified", category: "Genitourinary", billable: true },
  
  // Pregnancy (O00-O9A)
  { code: "O09.90", description: "Supervision of high risk pregnancy, unspecified, unspecified trimester", category: "Pregnancy", billable: true },
  
  // Skin (L00-L99)
  { code: "L03.90", description: "Cellulitis, unspecified", category: "Skin", billable: true },
  { code: "L30.9", description: "Dermatitis, unspecified", category: "Skin", billable: true },
  
  // Injury/Poisoning (S00-T88)
  { code: "S06.0X0A", description: "Concussion without loss of consciousness, initial encounter", category: "Injury", billable: true },
  { code: "S82.001A", description: "Unspecified fracture of right patella, initial encounter for closed fracture", category: "Injury", billable: true },
  { code: "T14.90XA", description: "Injury, unspecified, initial encounter", category: "Injury", billable: true },
  
  // External Causes (V00-Y99)
  { code: "W19.XXXA", description: "Unspecified fall, initial encounter", category: "External", billable: true },
  
  // Factors Influencing Health (Z00-Z99)
  { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Factors", billable: true },
  { code: "Z23", description: "Encounter for immunization", category: "Factors", billable: true },
  { code: "Z79.4", description: "Long term (current) use of insulin", category: "Factors", billable: true },
  { code: "Z87.891", description: "Personal history of nicotine dependence", category: "Factors", billable: true },
]

// Search function for ICD-10 codes
export function searchICD10Codes(query: string): ICD10Code[] {
  if (!query || query.length < 2) return []
  
  const searchTerm = query.toLowerCase()
  
  return sampleICD10Codes.filter(code => 
    code.code.toLowerCase().includes(searchTerm) ||
    code.description.toLowerCase().includes(searchTerm)
  ).slice(0, 20) // Limit to 20 results
}

// Get code by exact match
export function getICD10Code(code: string): ICD10Code | undefined {
  return sampleICD10Codes.find(c => c.code.toLowerCase() === code.toLowerCase())
}

// Get codes by category
export function getCodesByCategory(category: string): ICD10Code[] {
  return sampleICD10Codes.filter(code => code.category === category)
}

// Get random codes for placeholders
export function getRandomICD10Codes(count: number): ICD10Code[] {
  const shuffled = [...sampleICD10Codes].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
