# How to Import PDF Medical Coding Data into Your Web App

## Overview
You have PDF files containing:
- **Index** - Alphabetical listing of diseases/conditions
- **Tabular List** - Organized ICD-10 codes by chapter
- **Disease Table** - Structured disease data

## Method 1: PDF to JSON Conversion (Recommended)

### Tools Needed:
```bash
pnpm add pdf-parse
pnpm add -D @types/pdf-parse
```

### Step 1: Extract Text from PDF

Create `scripts/extract-pdf.ts`:

```typescript
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'

async function extractPDF(pdfPath: string) {
  const dataBuffer = fs.readFileSync(pdfPath)
  const data = await pdf(dataBuffer)
  
  // Save raw text
  fs.writeFileSync(
    path.join(__dirname, '../data/raw-extracted.txt'),
    data.text
  )
  
  console.log('Pages:', data.numpages)
  console.log('Text length:', data.text.length)
  return data.text
}

// Usage
extractPDF('./path-to-your-file.pdf')
```

### Step 2: Parse ICD-10 Tabular List

```typescript
interface ParsedCode {
  code: string
  description: string
  chapter?: string
  category?: string
  subcategory?: string
  notes?: string[]
  includes?: string[]
  excludes?: string[]
  billable: boolean
}

function parseTabularList(text: string): ParsedCode[] {
  const codes: ParsedCode[] = []
  const lines = text.split('\n')
  
  let currentChapter = ''
  let currentCode: Partial<ParsedCode> | null = null
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Detect chapter headers (e.g., "CHAPTER 1 - Certain infectious and parasitic diseases (A00-B99)")
    const chapterMatch = trimmed.match(/CHAPTER\s+(\d+)\s*-\s*(.+?)\s*\(([A-Z]\d+-[A-Z]\d+)\)/i)
    if (chapterMatch) {
      currentChapter = chapterMatch[2]
      continue
    }
    
    // Detect ICD-10 codes (e.g., "A09.9 Gastroenteritis and colitis of unspecified origin")
    const codeMatch = trimmed.match(/^([A-Z]\d{2,3}\.?\d*)\s+(.+)$/)
    if (codeMatch) {
      // Save previous code
      if (currentCode && currentCode.code) {
        codes.push(currentCode as ParsedCode)
      }
      
      // Start new code
      currentCode = {
        code: codeMatch[1],
        description: codeMatch[2],
        chapter: currentChapter,
        notes: [],
        includes: [],
        excludes: [],
        billable: !codeMatch[1].match(/\.$/) // Codes ending in . are usually headers
      }
      continue
    }
    
    // Detect notes and modifiers
    if (currentCode) {
      if (trimmed.startsWith('Includes:')) {
        currentCode.includes = currentCode.includes || []
        currentCode.includes.push(trimmed.replace('Includes:', '').trim())
      } else if (trimmed.startsWith('Excludes:')) {
        currentCode.excludes = currentCode.excludes || []
        currentCode.excludes.push(trimmed.replace('Excludes:', '').trim())
      } else if (trimmed.startsWith('Note:')) {
        currentCode.notes = currentCode.notes || []
        currentCode.notes.push(trimmed.replace('Note:', '').trim())
      }
    }
  }
  
  // Save last code
  if (currentCode && currentCode.code) {
    codes.push(currentCode as ParsedCode)
  }
  
  return codes
}
```

### Step 3: Parse Alphabetical Index

```typescript
interface IndexEntry {
  term: string
  code: string
  seeAlso?: string[]
  modifiers?: string[]
}

function parseAlphabeticalIndex(text: string): IndexEntry[] {
  const entries: IndexEntry[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Pattern: "Diabetes - see also E11.9"
    // Pattern: "Pneumonia J18.9"
    const entryMatch = trimmed.match(/^([A-Za-z\s,'-]+?)\s+([A-Z]\d{2,3}\.?\d*)/)
    if (entryMatch) {
      entries.push({
        term: entryMatch[1].trim(),
        code: entryMatch[2]
      })
    }
    
    // Pattern: "- with complications E11.8"
    const modifierMatch = trimmed.match(/^-\s+(.+?)\s+([A-Z]\d{2,3}\.?\d*)/)
    if (modifierMatch && entries.length > 0) {
      const lastEntry = entries[entries.length - 1]
      lastEntry.modifiers = lastEntry.modifiers || []
      lastEntry.modifiers.push(`${modifierMatch[1]} (${modifierMatch[2]})`)
    }
  }
  
  return entries
}
```

### Step 4: Save as JSON

```typescript
async function convertPDFtoJSON(pdfPath: string, outputPath: string) {
  console.log('Extracting PDF...')
  const text = await extractPDF(pdfPath)
  
  console.log('Parsing codes...')
  const codes = parseTabularList(text)
  
  console.log(`Found ${codes.length} codes`)
  
  // Save to JSON
  fs.writeFileSync(
    outputPath,
    JSON.stringify(codes, null, 2)
  )
  
  console.log(`Saved to ${outputPath}`)
}

// Run it
convertPDFtoJSON(
  './pdfs/icd10-tabular.pdf',
  './public/data/icd10-codes.json'
)
```

## Method 2: Use Online PDF to Excel Converters

### Quick Steps:
1. **Upload PDF** to https://www.adobe.com/acrobat/online/pdf-to-excel.html
2. **Download Excel** file
3. **Convert to JSON** using this script:

```typescript
import XLSX from 'xlsx'

function excelToJSON(excelPath: string) {
  const workbook = XLSX.readFile(excelPath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet)
  
  fs.writeFileSync(
    './public/data/codes.json',
    JSON.stringify(jsonData, null, 2)
  )
}
```

## Method 3: Manual CSV Creation (For Small Datasets)

Create CSV file:
```csv
code,description,chapter,billable
A09,Infectious gastroenteritis,Infectious Diseases,true
A41.9,Sepsis unspecified,Infectious Diseases,true
E11.9,Type 2 diabetes,Endocrine,true
```

Convert to JSON:
```typescript
import Papa from 'papaparse'

const csv = fs.readFileSync('./data/codes.csv', 'utf-8')
const parsed = Papa.parse(csv, { header: true })
fs.writeFileSync('./public/data/codes.json', JSON.stringify(parsed.data))
```

## Method 4: Database Approach (For Large Datasets)

### Use SQLite for 100k+ codes:

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

```typescript
import Database from 'better-sqlite3'

const db = new Database('./data/icd10.db')

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS codes (
    code TEXT PRIMARY KEY,
    description TEXT,
    chapter TEXT,
    category TEXT,
    billable INTEGER,
    notes TEXT
  )
`)

// Insert data
const insert = db.prepare(`
  INSERT INTO codes (code, description, chapter, billable)
  VALUES (?, ?, ?, ?)
`)

codes.forEach(code => {
  insert.run(code.code, code.description, code.chapter, code.billable ? 1 : 0)
})

// Query
const search = db.prepare(`
  SELECT * FROM codes 
  WHERE code LIKE ? OR description LIKE ?
  LIMIT 20
`)

export function searchCodes(query: string) {
  return search.all(`%${query}%`, `%${query}%`)
}
```

## Recommended Workflow for Your Project

### For Index Page (`app/index/page.tsx`):
```typescript
'use client'
import { useState, useEffect } from 'react'

export default function IndexPage() {
  const [index, setIndex] = useState([])
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    // Load alphabetical index
    fetch('/data/alphabetical-index.json')
      .then(r => r.json())
      .then(setIndex)
  }, [])
  
  const filtered = index.filter(entry =>
    entry.term.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <div className="p-6">
      <h1>Alphabetical Index</h1>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search conditions..."
      />
      
      <div className="mt-4">
        {filtered.map(entry => (
          <div key={entry.code} className="py-2 border-b">
            <div className="font-semibold">{entry.term}</div>
            <div className="text-sm text-gray-600">{entry.code}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### For Tabular List (`app/tabular/page.tsx`):
```typescript
'use client'
import { useState, useEffect } from 'react'

export default function TabularPage() {
  const [codes, setCodes] = useState([])
  const [selectedChapter, setSelectedChapter] = useState('all')
  
  useEffect(() => {
    fetch('/data/tabular-codes.json')
      .then(r => r.json())
      .then(setCodes)
  }, [])
  
  const chapters = [...new Set(codes.map(c => c.chapter))]
  
  const filtered = selectedChapter === 'all'
    ? codes
    : codes.filter(c => c.chapter === selectedChapter)
  
  return (
    <div className="p-6">
      <h1>Tabular List</h1>
      
      <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}>
        <option value="all">All Chapters</option>
        {chapters.map(ch => (
          <option key={ch} value={ch}>{ch}</option>
        ))}
      </select>
      
      <table className="mt-4 w-full">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Billable</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(code => (
            <tr key={code.code}>
              <td className="font-mono">{code.code}</td>
              <td>{code.description}</td>
              <td>{code.billable ? '✓' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### For Disease Table (`app/disease/page.tsx`):
Similar structure with additional filtering and categorization.

## Next Steps

1. **Share your PDF** - I can help write custom parser
2. **Choose method** - PDF parsing vs manual conversion
3. **Set up data folder** - Create `public/data/` directory
4. **Run conversion** - Extract and parse PDF data
5. **Integrate** - Connect JSON data to your pages

Would you like me to:
- Create the PDF extraction script?
- Set up the data loading infrastructure?
- Build the table components for Index/Tabular/Disease pages?
