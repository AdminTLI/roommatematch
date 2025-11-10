-- Migration: Reports Table Enhancement
-- Adds category, attachments, and auto_blocked fields to reports table

-- Create report category enum
CREATE TYPE report_category AS ENUM ('spam', 'harassment', 'inappropriate', 'other');

-- Add new columns to reports table
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS category report_category DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS auto_blocked BOOLEAN DEFAULT false;

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_auto_blocked ON reports (auto_blocked);

-- Update existing reports to have default category
UPDATE reports SET category = 'other' WHERE category IS NULL;


