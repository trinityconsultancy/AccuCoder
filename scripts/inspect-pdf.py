#!/usr/bin/env python3
"""
Inspect the PDF structure to understand the layout
"""

import pdfplumber

PDF_PATH = r"C:\Users\rusha\Downloads\AccuCoder\icd10cm_eindex_2026.pdf"

def inspect_pdf():
    """Inspect first few pages of the PDF"""
    print(f"Inspecting PDF: {PDF_PATH}\n")
    
    with pdfplumber.open(PDF_PATH) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")
        
        # Check first 5 pages
        for i in range(min(5, len(pdf.pages))):
            page = pdf.pages[i]
            print(f"\n{'='*80}")
            print(f"PAGE {i + 1}")
            print(f"{'='*80}")
            
            # Extract text
            text = page.extract_text()
            if text:
                lines = text.split('\n')[:30]  # First 30 lines
                for j, line in enumerate(lines, 1):
                    print(f"{j:3d}: {line}")
            else:
                print("No text extracted")
            
            # Check for tables
            tables = page.extract_tables()
            if tables:
                print(f"\nFound {len(tables)} table(s) on this page")
                print("First table sample:")
                for row in tables[0][:5]:
                    print(row)

if __name__ == "__main__":
    inspect_pdf()
