-- Add certification_body column to user_profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS certification_body TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN user_profiles.certification_body IS 'Certification organization body: AAPC or AHIMA';

-- Optional: Add a check constraint to ensure only valid values
ALTER TABLE user_profiles 
ADD CONSTRAINT certification_body_check 
CHECK (certification_body IN ('AAPC', 'AHIMA') OR certification_body IS NULL);
