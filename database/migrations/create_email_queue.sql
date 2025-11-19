-- Email Queue Table
-- This table manages the email sending queue with retry logic

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  template TEXT,
  template_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);

-- RLS Policies (only admins/superadmins can view email queue)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Admin/Superadmin can view all emails
CREATE POLICY "Admins can view all emails" ON email_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- System can insert emails (for API use)
CREATE POLICY "System can insert emails" ON email_queue
  FOR INSERT
  WITH CHECK (true);

-- System can update email status
CREATE POLICY "System can update emails" ON email_queue
  FOR UPDATE
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_updated_at();

-- Function to clean up old sent/failed emails (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_emails()
RETURNS void AS $$
BEGIN
  DELETE FROM email_queue
  WHERE status IN ('sent', 'failed')
  AND updated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE email_queue IS 'Email sending queue with retry logic';
COMMENT ON COLUMN email_queue.to IS 'Recipient email address';
COMMENT ON COLUMN email_queue.subject IS 'Email subject line';
COMMENT ON COLUMN email_queue.message IS 'Email message body (plain text or HTML)';
COMMENT ON COLUMN email_queue.template IS 'Template name to use (welcome, roleChanged, etc.)';
COMMENT ON COLUMN email_queue.template_data IS 'JSON data for template placeholders';
COMMENT ON COLUMN email_queue.status IS 'Email status: pending, sending, sent, failed';
COMMENT ON COLUMN email_queue.attempts IS 'Number of send attempts made';
COMMENT ON COLUMN email_queue.max_attempts IS 'Maximum number of retry attempts';
COMMENT ON COLUMN email_queue.scheduled_for IS 'When to send this email';
COMMENT ON COLUMN email_queue.sent_at IS 'When the email was successfully sent';
COMMENT ON COLUMN email_queue.error IS 'Error message if sending failed';
