import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'

// Define the structure of your disease table
export interface DiseaseTableRow {
  code: string
  description: string
  chapter?: string
  section?: string
  category?: string
  billable?: string
  [key: string]: any // Allow additional columns
}

/**
 * Extract and parse Disease Table PDF
 * Assumes PDF has a structured table format
 */
export async function extractDiseaseTablePDF(pdfPath: string): Promise<DiseaseTableRow[]> {
  console.log('Reading PDF file...')
  const dataBuffer = fs.readFileSync(pdfPath)
  
  console.log('Parsing PDF...')
  const data = await pdf(dataBuffer)
  
  console.log(`Extracted ${data.numpages} pages`)
  console.log(`Text length: ${data.text.length} characters`)
  
  // Save raw text for debugging
  const rawOutputPath = path.join(__dirname, '../public/data/disease-table-raw.txt')
  fs.mkdirSync(path.dirname(rawOutputPath), { recursive: true })
  fs.writeFileSync(rawOutputPath, data.text)
  console.log(`Raw text saved to: ${rawOutputPath}`)
  
  // Parse the table
  const rows = parseTableData(data.text)
  
  // Save as JSON
  const jsonOutputPath = path.join(__dirname, '../public/data/disease-table.json')
  fs.writeFileSync(jsonOutputPath, JSON.stringify(rows, null, 2))
  console.log(`Saved ${rows.length} rows to: ${jsonOutputPath}`)
  
  return rows
}

/**
 * Parse structured table data from PDF text
 * Adjust this function based on your PDF's specific format
 */
function parseTableData(text: string): DiseaseTableRow[] {
  const rows: DiseaseTableRow[] = []
  const lines = text.split('\n')
  
  let headers: string[] = []
  let inTable = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Skip empty lines
    if (!line) continue
    
    // Detect table headers (common patterns)
    if (line.match(/code\s+description/i) || 
        line.match(/icd-?10\s+description/i) ||
        line.match(/^code\s+|^description\s+/i)) {
      // Found header row
      headers = line.split(/\s{2,}|\t/) // Split by 2+ spaces or tabs
      inTable = true
      console.log('Detected headers:', headers)
      continue
    }
    
    // If we found headers, parse data rows
    if (inTable && headers.length > 0) {
      // Match ICD-10 code pattern (e.g., A00.0, J18.9, E11.65)
      const codeMatch = line.match(/^([A-Z]\d{2,3}\.?\d*[A-Z]?)\s+(.+)/)
      
      if (codeMatch) {
        const code = codeMatch[1]
        const rest = codeMatch[2]
        
        // Try to split the rest by multiple spaces or tabs
        const parts = rest.split(/\s{2,}|\t/).map(p => p.trim())
        
        const row: DiseaseTableRow = {
          code: code,
          description: parts[0] || rest,
        }
        
        // Map remaining parts to headers if available
        if (headers.length > 2) {
          parts.slice(1).forEach((part, idx) => {
            const headerIdx = idx + 2 // +2 because we already used code and description
            if (headers[headerIdx]) {
              row[headers[headerIdx].toLowerCase().replace(/\s+/g, '_')] = part
            }
          })
        }
        
        rows.push(row)
      }
    }
  }
  
  console.log(`Parsed ${rows.length} disease table rows`)
  return rows
}

/**
 * Alternative: Extract table using regex patterns
 * Use this if the first method doesn't work well
 */
function parseTableDataAlternative(text: string): DiseaseTableRow[] {
  const rows: DiseaseTableRow[] = []
  
  // Pattern to match typical ICD-10 table rows:
  // A00.0    Cholera due to Vibrio cholerae 01, biovar cholerae    Infectious
  const rowPattern = /([A-Z]\d{2,3}\.?\d*[A-Z]?)\s+([^\t\n]+?)(?:\s{2,}|\t)([^\t\n]+)?(?:\s{2,}|\t)?([^\t\n]+)?/g
  
  let match
  while ((match = rowPattern.exec(text)) !== null) {
    const row: DiseaseTableRow = {
      code: match[1].trim(),
      description: match[2].trim(),
    }
    
    // Add additional columns if present
    if (match[3]) row.category = match[3].trim()
    if (match[4]) row.billable = match[4].trim()
    
    rows.push(row)
  }
  
  return rows
}

// CLI usage
if (require.main === module) {
  const pdfPath = process.argv[2]
  
  if (!pdfPath) {
    console.error('Usage: ts-node extract-disease-table.ts <path-to-pdf>')
    console.error('Example: ts-node extract-disease-table.ts ./pdfs/disease-table.pdf')
    process.exit(1)
  }
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found: ${pdfPath}`)
    process.exit(1)
  }
  
  extractDiseaseTablePDF(pdfPath)
    .then(rows => {
      console.log('\n✅ Extraction complete!')
      console.log(`📊 Total rows: ${rows.length}`)
      console.log('\n📝 Sample rows:')
      console.log(JSON.stringify(rows.slice(0, 3), null, 2))
    })
    .catch(err => {
      console.error('❌ Error:', err)
      process.exit(1)
    })
}

export default extractDiseaseTablePDF
