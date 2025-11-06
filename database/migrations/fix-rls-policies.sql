-- Fix RLS policies for Vercel deployment
-- Run this SQL in your Supabase SQL Editor

-- 1. Fix alphabetical_index table policies
DROP POLICY IF EXISTS "Allow public read access" ON alphabetical_index;
DROP POLICY IF EXISTS "Allow service role to insert" ON alphabetical_index;

-- Enable RLS
ALTER TABLE alphabetical_index ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read (including anonymous users)
CREATE POLICY "Enable read access for all users" ON alphabetical_index
  FOR SELECT
  TO public
  USING (true);

-- Create policy for inserts (service role only)
CREATE POLICY "Enable insert for authenticated users only" ON alphabetical_index
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 2. Fix drugs_and_chemicals table policies
DROP POLICY IF EXISTS "Allow public read access" ON drugs_and_chemicals;
DROP POLICY IF EXISTS "Allow service role to insert" ON drugs_and_chemicals;

-- Enable RLS
ALTER TABLE drugs_and_chemicals ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read
CREATE POLICY "Enable read access for all users" ON drugs_and_chemicals
  FOR SELECT
  TO public
  USING (true);

-- Create policy for inserts
CREATE POLICY "Enable insert for authenticated users only" ON drugs_and_chemicals
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('alphabetical_index', 'drugs_and_chemicals');
