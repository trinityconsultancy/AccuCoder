-- Fix RLS policies for drugs_and_chemicals table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON drugs_and_chemicals;
DROP POLICY IF EXISTS "Allow authenticated insert" ON drugs_and_chemicals;
DROP POLICY IF EXISTS "Allow authenticated update" ON drugs_and_chemicals;
DROP POLICY IF EXISTS "Allow authenticated delete" ON drugs_and_chemicals;

-- Enable RLS
ALTER TABLE drugs_and_chemicals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read data (including anonymous users)
CREATE POLICY "Enable read access for all users" 
ON drugs_and_chemicals
FOR SELECT 
TO anon, authenticated
USING (true);

-- Optional: Allow authenticated users to insert/update/delete
CREATE POLICY "Enable insert for authenticated users only" 
ON drugs_and_chemicals
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON drugs_and_chemicals
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON drugs_and_chemicals
FOR DELETE 
TO authenticated
USING (true);
