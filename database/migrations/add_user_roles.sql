-- Add role column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create role check constraint
ALTER TABLE user_profiles
ADD CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'superadmin'));

-- Set Rohitpekhale690@gmail.com as superadmin
UPDATE user_profiles
SET role = 'superadmin'
WHERE email = 'Rohitpekhale690@gmail.com';
