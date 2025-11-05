# Alphabetical Index Import Guide

## Option 1: If you have CSV/Excel version
If you have a CSV or Excel file of the alphabetical index, we can import it directly.

## Option 2: Extract from PDF

### Step 1: Install Python packages
```powershell
pip install pdfplumber pandas openpyxl
```

### Step 2: Run extraction script
```powershell
python scripts/extract-alphabetic-index.py
```

This will create: `data/alphabetic_index_2026.csv`

### Step 3: Review the data
Open the CSV file and check if extraction worked correctly.

## Option 3: Manual CSV from CMS
Download the official CSV version from:
https://www.cms.gov/medicare/coding-billing/icd-10-codes

Look for "ICD-10-CM Files" → "Alphabetical Index"

## Next Steps
Once you have clean CSV data, I'll help you:
1. Create Supabase table schema
2. Import the data
3. Build the search interface
4. Integrate with AccuBot

Let me know which option you'd like to use!
