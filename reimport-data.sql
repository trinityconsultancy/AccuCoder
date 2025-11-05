-- Clean up and reimport drugs and chemicals data

-- Step 1: Delete all existing data
DELETE FROM drugs_and_chemicals;

-- Step 2: Reset the ID sequence
ALTER SEQUENCE drugs_and_chemicals_id_seq RESTART WITH 1;

-- Now you can import the CSV file: icd10cm_drug_2026_final.csv
-- Go to Supabase Dashboard → Table Editor → drugs_and_chemicals → Import Data
