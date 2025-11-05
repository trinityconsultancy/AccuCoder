# Medical Coding Data Sources

## ICD-10-CM Official Data (FREE from CMS)

### Download Official CMS Data

1. **Visit CMS.gov ICD-10-CM Downloads**
   - URL: https://www.cms.gov/medicare/coding-billing/icd-10-codes
   - Download the latest ICD-10-CM code files (updated annually)

2. **Files Included:**
   - `icd10cm_codes_YYYY.txt` - All valid codes
   - `icd10cm_order_YYYY.txt` - Code ordering
   - Documentation and guidelines

3. **File Format:**
   - Tab-delimited text file
   - Columns: Code, Description (short), Description (long), Billable flag

### Load Data into Your App

```typescript
// Example parser for CMS ICD-10-CM files
export async function parseCMSData(fileContent: string): Promise<ICD10Code[]> {
  const lines = fileContent.split('\n')
  const codes: ICD10Code[] = []
  
  for (const line of lines) {
    const [code, shortDesc, longDesc, billable] = line.split('\t')
    if (code && shortDesc) {
      codes.push({
        code: code.trim(),
        description: (longDesc || shortDesc).trim(),
        billable: billable === '1'
      })
    }
  }
  
  return codes
}
```

## CPT Codes (Proprietary - AMA License Required)

⚠️ **Important**: CPT codes are copyrighted by the American Medical Association (AMA)

### Legal Options:

1. **Purchase AMA License**
   - URL: https://www.ama-assn.org/practice-management/cpt
   - Required for commercial use
   - Includes official code database

2. **Use CMS Medicare Fee Schedule**
   - URL: https://www.cms.gov/medicare/payment/fee-schedules/physician
   - Free but limited to Medicare-covered procedures
   - Download Physician Fee Schedule database

3. **API Integration (Recommended)**
   - Partner with licensed medical coding API providers
   - Examples: Infermedica, ClinicalTables.nlm.nih.gov

## Free Alternative: NLM Clinical Tables API

### No Installation Required - Real-time API

```typescript
// Example: Search ICD-10 codes via NLM API
async function searchNLMAPI(query: string) {
  const url = `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(query)}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  // Returns: [totalCount, codes, null, descriptions]
  const [count, codes, , descriptions] = data
  
  return codes.map((code: string, i: number) => ({
    code,
    description: descriptions[i]
  }))
}
```

### NLM API Features:
- ✅ Free to use
- ✅ No API key required
- ✅ Official NIH/NLM data
- ✅ Includes ICD-10, RxNorm, LOINC
- ✅ Real-time search with autocomplete

## Implementation Steps

### Step 1: For Development (Current)
- Use the sample data in `icd10-data.ts` and `cpt-data.ts`
- ~50 most common codes included
- Perfect for UI development and testing

### Step 2: For Production (Choose One)

**Option A: Load CMS Static Data**
1. Download CMS ICD-10-CM file (updated annually)
2. Parse and import into your database or JSON file
3. Use local search functions
4. Pros: Fast, offline, no API limits
5. Cons: Large file (~100k codes), manual updates

**Option B: Use NLM API**
1. Implement API calls in search functions
2. Add caching layer for performance
3. Pros: Always up-to-date, no storage needed
4. Cons: Requires internet, rate limits

**Option C: Hybrid Approach (Recommended)**
1. Load top 1000 most common codes locally
2. Fall back to NLM API for advanced searches
3. Cache API results in localStorage
4. Best of both worlds

## Next Steps

### Integrate with Search Bar

Update `top-navbar.tsx` to use real search:

```typescript
import { searchMedicalCodes } from '@/lib/medical-code-search'

const [searchResults, setSearchResults] = useState([])

const handleSearch = (query: string) => {
  const results = searchMedicalCodes(query)
  setSearchResults(results)
}
```

### Create Search Results Dropdown

Add autocomplete dropdown below search bar showing:
- Code number
- Description
- Code type (ICD-10 vs CPT)
- Category/chapter

### Add Code Details Page

When user selects a code, show:
- Full description
- Billable status
- Related codes
- Clinical guidelines
- Example usage

## Resources

- **CMS ICD-10**: https://www.cms.gov/medicare/coding-billing/icd-10-codes
- **NLM API Docs**: https://clinicaltables.nlm.nih.gov/
- **WHO ICD**: https://icd.who.int/
- **AMA CPT**: https://www.ama-assn.org/practice-management/cpt
