# Import Disease Table to Supabase

## Method 1: PDF → Excel → CSV → Supabase (Recommended - Easiest)

### Step 1: Convert PDF to Excel
1. Go to https://www.adobe.com/acrobat/online/pdf-to-excel.html
2. Upload your Disease Table PDF
3. Download the Excel file

### Step 2: Clean Excel Data
1. Open in Excel/Google Sheets
2. Ensure column headers are:
   - `substance`
   - `accidental`
   - `intentional`
   - `assault`
   - `undetermined`
   - `adverse_effect`
   - `underdosing`
3. Save as CSV (UTF-8)

### Step 3: Create Supabase Table

Go to Supabase SQL Editor and run:

```sql
-- Create disease_table
CREATE TABLE disease_table (
  id BIGSERIAL PRIMARY KEY,
  substance TEXT NOT NULL,
  accidental TEXT,
  intentional TEXT,
  assault TEXT,
  undetermined TEXT,
  adverse_effect TEXT,
  underdosing TEXT,
  is_subcategory BOOLEAN DEFAULT FALSE,
  parent_substance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast searching
CREATE INDEX idx_disease_substance ON disease_table USING gin(to_tsvector('english', substance));
CREATE INDEX idx_disease_accidental ON disease_table(accidental);
CREATE INDEX idx_disease_parent ON disease_table(parent_substance);

-- Enable Row Level Security (optional)
ALTER TABLE disease_table ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust as needed)
CREATE POLICY "Allow public read access" ON disease_table
  FOR SELECT TO public
  USING (true);
```

### Step 4: Import CSV to Supabase

**Option A: Supabase Dashboard (GUI)**
1. Go to Supabase Dashboard → Table Editor
2. Click on `disease_table`
3. Click "Insert" → "Import data from CSV"
4. Upload your CSV file
5. Map columns and import

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase 

# Login
supabase login

# Import CSV
supabase db push --csv disease_table.csv
```

**Option C: Bulk Insert via SQL**
```sql
-- Copy CSV data (in Supabase SQL Editor)
COPY disease_table(substance, accidental, intentional, assault, undetermined, adverse_effect, underdosing)
FROM '/path/to/disease_table.csv'
DELIMITER ','
CSV HEADER;
```

---

## Method 2: PDF → JSON → Supabase Insert Script

### Step 1: Install Dependencies
```bash
pnpm add @supabase/supabase-js
pnpm add -D pdf-parse
```

### Step 2: Create Import Script

Save as `scripts/import-to-supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY! // Use service key for admin access

const supabase = createClient(supabaseUrl, supabaseKey)

interface DiseaseRow {
  substance: string
  accidental: string | null
  intentional: string | null
  assault: string | null
  undetermined: string | null
  adverse_effect: string | null
  underdosing: string | null
  is_subcategory: boolean
  parent_substance: string | null
}

async function importDiseaseTable(jsonPath: string) {
  console.log('Reading JSON file...')
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as DiseaseRow[]
  
  console.log(`Found ${data.length} rows`)
  
  // Batch insert (1000 rows at a time for performance)
  const batchSize = 1000
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}...`)
    
    const { data: result, error } = await supabase
      .from('disease_table')
      .insert(batch)
    
    if (error) {
      console.error('Error inserting batch:', error)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`✓ Inserted ${batch.length} rows`)
    }
  }
  
  console.log('\n=== Import Complete ===')
  console.log(`✓ Success: ${successCount} rows`)
  console.log(`✗ Errors: ${errorCount} rows`)
}

// Run
const jsonPath = process.argv[2] || './public/data/disease-table.json'
importDiseaseTable(jsonPath)
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
```

### Step 3: Setup Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

### Step 4: Run Import
```bash
tsx scripts/import-to-supabase.ts ./path/to/disease-table.json
```

---

## Method 3: Excel → Google Sheets → Supabase (No Code)

### Step 1: Convert PDF to Google Sheets
1. Upload PDF to Google Drive
2. Open with Google Sheets (or import Excel)

### Step 2: Use Supabase Integration
1. In Google Sheets, go to Extensions → Add-ons → Get add-ons
2. Search for "Supabase" or use Apps Script
3. Or use this Google Sheets formula to generate INSERT statements:

```
=CONCATENATE("INSERT INTO disease_table VALUES ('", A2, "','", B2, "','", C2, "','", D2, "','", E2, "','", F2, "','", G2, "');")
```

4. Copy generated SQL and paste into Supabase SQL Editor

---

## Method 4: Direct Excel Upload (Fastest)

### Use online CSV to SQL converter:

1. **Convert Excel to CSV**
2. **Use CSV to SQL Generator**: https://www.convertcsv.com/csv-to-sql.htm
3. **Configure**:
   - Table name: `disease_table`
   - Include headers
   - Generate INSERT statements
4. **Copy SQL output**
5. **Paste into Supabase SQL Editor**

---

## Recommended Workflow

### For Your Case (Poisoning Table):

**Fastest Path:**
1. ✅ Convert PDF to Excel (Adobe online tool - 2 minutes)
2. ✅ Clean data in Excel (5 minutes)
3. ✅ Save as CSV (1 minute)
4. ✅ Create table in Supabase SQL Editor (copy SQL above - 1 minute)
5. ✅ Import CSV via Supabase Dashboard (2 minutes)

**Total time: ~10 minutes!**

---

## Sample Data Structure

Your JSON should look like:

```json
[
  {
    "substance": "ABOB",
    "accidental": "T37.5X1",
    "intentional": "T37.5X2",
    "assault": "T37.5X3",
    "undetermined": "T37.5X4",
    "adverse_effect": "T37.5X5",
    "underdosing": "T37.5X6",
    "is_subcategory": false,
    "parent_substance": null
  },
  {
    "substance": "beverage",
    "accidental": "T51.0X1",
    "intentional": "T51.0X2",
    "assault": "T51.0X3",
    "undetermined": "T51.0X4",
    "adverse_effect": null,
    "underdosing": null,
    "is_subcategory": true,
    "parent_substance": "Absinthe"
  }
]
```

---

## After Import: Query Examples

```typescript
// In your Next.js app
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Search by substance
const { data } = await supabase
  .from('disease_table')
  .select('*')
  .ilike('substance', '%acetaminophen%')

// Get all with specific code
const { data } = await supabase
  .from('disease_table')
  .select('*')
  .eq('accidental', 'T39.1X1')

// Full-text search
const { data } = await supabase
  .from('disease_table')
  .select('*')
  .textSearch('substance', 'aspirin')
```

---

## Which method do you prefer?

1. **PDF → Excel → CSV → Supabase Dashboard** (Easiest, no coding)
2. **Automated script** (I'll create the complete import pipeline)
3. **Google Sheets integration** (Visual, collaborative)

Let me know and I'll help you set it up! 🚀
