-- Drop the existing INSERT policy and recreate it to allow signup
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Allow users to insert their profile during signup
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true);
