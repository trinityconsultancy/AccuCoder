-- Verify and fix RLS policies
-- Run this in Supabase SQL Editor

-- 1. Check current policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd 
FROM pg_policies 
WHERE tablename IN ('alphabetical_index', 'drugs_and_chemicals');

-- 2. If no policies shown, or if data still doesn't load, 
--    DISABLE RLS temporarily to test:

ALTER TABLE alphabetical_index DISABLE ROW LEVEL SECURITY;
ALTER TABLE drugs_and_chemicals DISABLE ROW LEVEL SECURITY;

-- After running this, test your Vercel site again.
-- Data should load now.

-- 3. If data loads after disabling RLS, re-enable with proper policies:
-- (Run this after confirming data loads)

-- ALTER TABLE alphabetical_index ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drugs_and_chemicals ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public read access" ON alphabetical_index
--   FOR SELECT USING (true);

-- CREATE POLICY "Public read access" ON drugs_and_chemicals
--   FOR SELECT USING (true);
