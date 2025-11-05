#!/usr/bin/env python3
"""
Extract alphabetical index from ICD-10-CM PDF
"""

import pdfplumber
import pandas as pd
import re

PDF_PATH = r"C:\Users\rusha\Downloads\AccuCoder\icd10cm_eindex_2026.pdf"
OUTPUT_CSV = r"C:\Users\rusha\Downloads\AccuCoder\data\alphabetic_index_2026.csv"

def clean_term(term):
    """Clean up the term by removing leading dashes and extra spaces"""
    # Remove leading dashes and spaces
    term = re.sub(r'^[-\s]+', '', term)
    # Normalize spaces
    term = re.sub(r'\s+', ' ', term)
    return term.strip()

def extract_entries(text):
    """Extract entries from PDF text"""
    entries = []
    
    if not text:
        return entries
    
    lines = text.split('\n')
    
    for line in lines:
        original_line = line
        line = line.rstrip()
        
        if not line or len(line) < 3:
            continue
        
        # Skip header lines
        if 'ICD-10-CM' in line or line.strip() in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']:
            continue
        
        # Pattern 1: Line ending with a code (e.g., "Abandonment ... X58")
        # Codes can be: X58, V94.4, O03.9, etc.
        code_at_end = r'^(.+?)\s+([A-Z]\d{2}(?:\.\d{1,4})?)\s*$'
        match = re.match(code_at_end, line)
        
        if match:
            term = clean_term(match.group(1))
            code = match.group(2).strip()
            
            # Check if it's a "see" or "see also" reference with a code
            if ' -see also ' in term:
                parts = term.split(' -see also ')
                main_term = clean_term(parts[0])
                see_also_ref = clean_term(parts[1])
                entries.append({
                    'term': main_term,
                    'code': code,
                    'reference': None,
                    'see_also': see_also_ref,
                    'type': 'code_with_see_also',
                    'indent_level': len(original_line) - len(original_line.lstrip())
                })
            elif ' -see ' in term:
                # This shouldn't happen with a code, but handle it anyway
                parts = term.split(' -see ')
                main_term = clean_term(parts[0])
                see_ref = clean_term(parts[1])
                entries.append({
                    'term': main_term,
                    'code': code,
                    'reference': see_ref,
                    'see_also': None,
                    'type': 'code_with_see',
                    'indent_level': len(original_line) - len(original_line.lstrip())
                })
            else:
                entries.append({
                    'term': term,
                    'code': code,
                    'reference': None,
                    'see_also': None,
                    'type': 'code',
                    'indent_level': len(original_line) - len(original_line.lstrip())
                })
            continue
        
        # Pattern 2: "see also" references
        see_also_pattern = r'^(.+?)\s+-\s*see\s+also\s+(.+)$'
        match = re.match(see_also_pattern, line, re.IGNORECASE)
        
        if match:
            term = clean_term(match.group(1))
            see_also = clean_term(match.group(2))
            entries.append({
                'term': term,
                'code': None,
                'reference': None,
                'see_also': see_also,
                'type': 'see_also',
                'indent_level': len(original_line) - len(original_line.lstrip())
            })
            continue
        
        # Pattern 3: "see" references
        see_pattern = r'^(.+?)\s+-\s*see\s+(.+)$'
        match = re.match(see_pattern, line, re.IGNORECASE)
        
        if match:
            term = clean_term(match.group(1))
            reference = clean_term(match.group(2))
            entries.append({
                'term': term,
                'code': None,
                'reference': reference,
                'see_also': None,
                'type': 'see',
                'indent_level': len(original_line) - len(original_line.lstrip())
            })
            continue
    
    return entries

def main():
    print("Starting PDF extraction...")
    print(f"Input: {PDF_PATH}")
    print(f"Output: {OUTPUT_CSV}")
    
    all_entries = []
    
    with pdfplumber.open(PDF_PATH) as pdf:
        total_pages = len(pdf.pages)
        print(f"Processing {total_pages} pages...")
        
        for i, page in enumerate(pdf.pages):
            if (i + 1) % 10 == 0:
                print(f"  Page {i + 1}/{total_pages}")
            
            text = page.extract_text()
            entries = extract_entries(text)
            all_entries.extend(entries)
    
    print(f"\nExtracted {len(all_entries)} entries")
    
    # Create DataFrame
    df = pd.DataFrame(all_entries)
    
    if len(df) > 0:
        # Save to CSV
        df.to_csv(OUTPUT_CSV, index=False)
        print(f"\nSaved to: {OUTPUT_CSV}")
        
        # Print statistics
        print("\nSample entries:")
        print(df.head(20))
        
        print(f"\nTotal entries: {len(df)}")
        if 'code' in df.columns:
            print(f"Entries with codes: {len(df[df['code'].notna()])}")
        if 'type' in df.columns:
            print(f"\nBreakdown by type:")
            print(df['type'].value_counts())
    else:
        print("\nNo entries extracted!")

if __name__ == "__main__":
    main()
