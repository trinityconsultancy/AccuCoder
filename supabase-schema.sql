-- ICD-10-CM TABLE of DRUGS and CHEMICALS
-- Create table with exact column names from the converted file

CREATE TABLE drugs_and_chemicals (
  id BIGSERIAL PRIMARY KEY,
  substance TEXT NOT NULL,
  poisoning_accidental_unintentional TEXT,
  poisoning_intentional_self_harm TEXT,
  poisoning_assault TEXT,
  poisoning_undetermined TEXT,
  adverse_effect TEXT,
  underdosing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast searching
CREATE INDEX idx_drugs_substance ON drugs_and_chemicals USING gin(to_tsvector('english', substance));
CREATE INDEX idx_drugs_substance_lower ON drugs_and_chemicals (LOWER(substance));
CREATE INDEX idx_drugs_accidental ON drugs_and_chemicals (poisoning_accidental_unintentional);
CREATE INDEX idx_drugs_intentional ON drugs_and_chemicals (poisoning_intentional_self_harm);
CREATE INDEX idx_drugs_assault ON drugs_and_chemicals (poisoning_assault);
CREATE INDEX idx_drugs_undetermined ON drugs_and_chemicals (poisoning_undetermined);
CREATE INDEX idx_drugs_adverse ON drugs_and_chemicals (adverse_effect);
CREATE INDEX idx_drugs_underdose ON drugs_and_chemicals (underdosing);

-- Create composite index for full-text search on all codes
CREATE INDEX idx_drugs_all_codes ON drugs_and_chemicals USING gin(
  to_tsvector('english',
    COALESCE(poisoning_accidental_unintentional, '') || ' ' ||
    COALESCE(poisoning_intentional_self_harm, '') || ' ' ||
    COALESCE(poisoning_assault, '') || ' ' ||
    COALESCE(poisoning_undetermined, '') || ' ' ||
    COALESCE(adverse_effect, '') || ' ' ||
    COALESCE(underdosing, '')
  )
);

-- Enable Row Level Security (optional - adjust based on your needs)
ALTER TABLE drugs_and_chemicals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON drugs_and_chemicals
  FOR SELECT TO public
  USING (true);

-- Policy: Restrict insert/update/delete to authenticated users only (optional)
CREATE POLICY "Allow authenticated insert" ON drugs_and_chemicals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON drugs_and_chemicals
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete" ON drugs_and_chemicals
  FOR DELETE TO authenticated
  USING (true);

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_drugs_and_chemicals_updated_at
  BEFORE UPDATE ON drugs_and_chemicals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE drugs_and_chemicals IS 'ICD-10-CM Table of Drugs and Chemicals with poisoning codes';
COMMENT ON COLUMN drugs_and_chemicals.substance IS 'Name of the drug, chemical, or substance';
COMMENT ON COLUMN drugs_and_chemicals.poisoning_accidental_unintentional IS 'ICD-10 code for accidental/unintentional poisoning';
COMMENT ON COLUMN drugs_and_chemicals.poisoning_intentional_self_harm IS 'ICD-10 code for intentional self-harm poisoning';
COMMENT ON COLUMN drugs_and_chemicals.poisoning_assault IS 'ICD-10 code for poisoning by assault';
COMMENT ON COLUMN drugs_and_chemicals.poisoning_undetermined IS 'ICD-10 code for poisoning of undetermined intent';
COMMENT ON COLUMN drugs_and_chemicals.adverse_effect IS 'ICD-10 code for adverse effect';
COMMENT ON COLUMN drugs_and_chemicals.underdosing IS 'ICD-10 code for underdosing';
