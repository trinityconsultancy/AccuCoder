-- Add position column to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS position TEXT;
