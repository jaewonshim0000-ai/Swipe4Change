-- Swipe4Change ??Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;
  push_token TEXT,
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_email TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ALTER COLUMN reported_item_id TYPE TEXT USING reported_item_id::TEXT;
