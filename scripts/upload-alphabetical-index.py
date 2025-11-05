#!/usr/bin/env python3
"""
Upload alphabetical index data to Supabase
"""

import pandas as pd
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env.local or .env
load_dotenv('.env.local')
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

CSV_PATH = r"C:\Users\rusha\Downloads\AccuCoder\data\alphabetic_index_2026.csv"

def upload_to_supabase():
    """Upload alphabetical index data to Supabase"""
    
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Read CSV
    print(f"Reading CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    
    # Convert DataFrame to list of dicts
    records = df.to_dict('records')
    print(f"Total records: {len(records)}")
    
    # Replace NaN with None for Supabase
    for record in records:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None
    
    # Upload in batches (Supabase has limits)
    batch_size = 1000
    total_batches = (len(records) + batch_size - 1) // batch_size
    
    print(f"\nUploading {len(records)} records in {total_batches} batches...")
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            result = supabase.table('alphabetical_index').insert(batch).execute()
            print(f"  Batch {batch_num}/{total_batches}: Uploaded {len(batch)} records")
        except Exception as e:
            print(f"  Batch {batch_num}/{total_batches}: Error - {str(e)}")
            # Continue with next batch
    
    print("\nUpload complete!")
    
    # Verify upload
    try:
        count_result = supabase.table('alphabetical_index').select('id', count='exact').execute()
        print(f"\nTotal records in database: {count_result.count}")
    except Exception as e:
        print(f"Could not verify count: {str(e)}")

if __name__ == "__main__":
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Supabase credentials not found in .env file")
        print("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)")
        exit(1)
    
    upload_to_supabase()
