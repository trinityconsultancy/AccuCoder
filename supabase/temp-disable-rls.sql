-- Temporary: Disable RLS to test if connection works
-- WARNING: This makes the table publicly writable. Use only for testing!

ALTER TABLE user_reviews DISABLE ROW LEVEL SECURITY;

-- After confirming it works, you can re-enable with:
-- ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
