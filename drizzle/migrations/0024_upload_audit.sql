-- Migration: 0024_upload_audit
-- Creates upload_audit table for tracking upload activity

CREATE TABLE IF NOT EXISTS upload_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  blob_path TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE upload_audit IS 'Tracks upload activity for security auditing';
COMMENT ON COLUMN upload_audit.success IS 'Whether the upload succeeded';
COMMENT ON COLUMN upload_audit.failure_reason IS 'Reason for failure if success is false';
