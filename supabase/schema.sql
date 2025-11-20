-- Create user_reviews table in Supabase

CREATE TABLE IF NOT EXISTS user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_reviews_status ON user_reviews(status);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reviews_country ON user_reviews(country);

-- Enable Row Level Security (RLS)
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (including anonymous users) can insert reviews
CREATE POLICY "Anyone can insert reviews"
  ON user_reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON user_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Policy: Only authenticated users can read all reviews (for admin)
CREATE POLICY "Authenticated users can read all reviews"
  ON user_reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update review status
CREATE POLICY "Authenticated users can update reviews"
  ON user_reviews
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_reviews_updated_at
    BEFORE UPDATE ON user_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE user_reviews IS 'Stores user submitted reviews and testimonials for AccuCoder';
COMMENT ON COLUMN user_reviews.status IS 'pending: awaiting approval, approved: visible to public, rejected: hidden';
