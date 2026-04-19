-- Swipe4Change — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  location TEXT,
  address TEXT,
  interests JSONB DEFAULT '[]',
  signature TEXT,
  profile_pic_url TEXT,
  level INTEGER DEFAULT 1,
  signature_count INTEGER DEFAULT 0,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMPTZ,
  push_token TEXT,
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Petitions
CREATE TABLE IF NOT EXISTS petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  ask TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT,
  urgency TEXT DEFAULT 'medium',
  recipient TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  signature_goal INTEGER,
  current_signatures INTEGER DEFAULT 0,
  weekly_increase INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signatures
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  petition_id UUID NOT NULL REFERENCES petitions(id),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, petition_id)
);

-- Saved Petitions
CREATE TABLE IF NOT EXISTS saved_petitions (
  user_id UUID NOT NULL REFERENCES users(id),
  petition_id UUID NOT NULL REFERENCES petitions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, petition_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  petition_id UUID REFERENCES petitions(id),
  verified BOOLEAN DEFAULT FALSE,
  recipient TEXT,
  situation TEXT,
  ask TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  reporter_email TEXT,
  reported_item_type TEXT NOT NULL,
  reported_item_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_email TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ALTER COLUMN reported_item_id TYPE TEXT USING reported_item_id::TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_petitions_category ON petitions(category);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_signatures_user ON signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_signatures_petition ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_petitions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public app reads. Writes should go through the Render API using SUPABASE_SERVICE_ROLE_KEY.
DROP POLICY IF EXISTS "Public can read visible petitions" ON petitions;
CREATE POLICY "Public can read visible petitions"
  ON petitions FOR SELECT
  USING (status IN ('approved', 'active', 'pending'));

DROP POLICY IF EXISTS "Public can create pending petitions" ON petitions;
CREATE POLICY "Public can create pending petitions"
  ON petitions FOR INSERT
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Users table is service only" ON users;
CREATE POLICY "Users table is service only"
  ON users FOR ALL
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Signatures are service only" ON signatures;
CREATE POLICY "Signatures are service only"
  ON signatures FOR ALL
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Saved petitions are service only" ON saved_petitions;
CREATE POLICY "Saved petitions are service only"
  ON saved_petitions FOR ALL
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Notifications are service only" ON notifications;
CREATE POLICY "Notifications are service only"
  ON notifications FOR ALL
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Reports are service only" ON reports;
CREATE POLICY "Reports are service only"
  ON reports FOR ALL
  USING (false)
  WITH CHECK (false);
