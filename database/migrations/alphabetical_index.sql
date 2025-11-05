-- Alphabetical Index Table Migration
-- This table stores the ICD-10-CM External Cause of Injuries Index (alphabetical index)

CREATE TABLE IF NOT EXISTS alphabetical_index (
  id BIGSERIAL PRIMARY KEY,
  term TEXT NOT NULL,
  code TEXT,
  reference TEXT,
  see_also TEXT,
  type TEXT NOT NULL,
  indent_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable Row Level Security for public read access
ALTER TABLE alphabetical_index ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access
CREATE POLICY "Allow public read access" ON alphabetical_index
  FOR SELECT
  USING (true);

-- Create a policy that allows service role to insert
CREATE POLICY "Allow service role to insert" ON alphabetical_index
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for faster searching
CREATE INDEX idx_alphabetical_index_term ON alphabetical_index USING GIN (to_tsvector('english', term));
CREATE INDEX idx_alphabetical_index_code ON alphabetical_index (code) WHERE code IS NOT NULL;
CREATE INDEX idx_alphabetical_index_type ON alphabetical_index (type);
CREATE INDEX idx_alphabetical_index_term_text ON alphabetical_index (term);

-- Add comments
COMMENT ON TABLE alphabetical_index IS 'ICD-10-CM External Cause of Injuries alphabetical index';
COMMENT ON COLUMN alphabetical_index.term IS 'The medical term or condition';
COMMENT ON COLUMN alphabetical_index.code IS 'The ICD-10-CM code (if applicable)';
COMMENT ON COLUMN alphabetical_index.reference IS 'Cross-reference for "see" entries';
COMMENT ON COLUMN alphabetical_index.see_also IS 'Additional references for "see also" entries';
COMMENT ON COLUMN alphabetical_index.type IS 'Entry type: code, see, see_also, code_with_see, code_with_see_also';
COMMENT ON COLUMN alphabetical_index.indent_level IS 'Indentation level in the original index (for hierarchy)';
COMMENT ON COLUMN alphabetical_index.type IS 'Entry type: code, see, see_also, code_with_see, code_with_see_also';
COMMENT ON COLUMN alphabetical_index.indent_level IS 'Indentation level in the original index (for hierarchy)';
