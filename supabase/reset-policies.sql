-- Reset RLS Policies for user_reviews table
-- Run this in Supabase SQL Editor to fix the RLS policy issue

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Anyone can insert reviews" ON user_reviews;
DROP POLICY IF EXISTS "Public can insert reviews" ON user_reviews;
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON user_reviews;
DROP POLICY IF EXISTS "Public can read approved reviews" ON user_reviews;
DROP POLICY IF EXISTS "Authenticated users can read all reviews" ON user_reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON user_reviews;

-- Step 2: Disable RLS temporarily
ALTER TABLE user_reviews DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new policies with correct roles
-- Allow anonymous (anon) and authenticated users to insert reviews
CREATE POLICY "Anyone can insert reviews"
  ON user_reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous and authenticated users to read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON user_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Allow authenticated users (admin) to read all reviews
CREATE POLICY "Authenticated users can read all reviews"
  ON user_reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (admin) to update reviews
CREATE POLICY "Authenticated users can update reviews"
  ON user_reviews
  FOR UPDATE
  TO authenticated
  USING (true);

-- Step 5: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_reviews'
ORDER BY policyname;
