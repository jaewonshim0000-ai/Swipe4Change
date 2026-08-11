-- Swipe4Change - Supabase schema
-- Run this whole file in the Supabase SQL Editor (it is safe to re-run).
--
-- Ids are TEXT, not UUID, on purpose: petition ids come from three places -
-- the built-in seed deck ("p1".."p8"), Regulations.gov ("reg_..."), and
-- Action Network ("an_...") - and the API compares them against this table.
-- A UUID column would reject those with "invalid input syntax for type uuid".

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  firebase_uid TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  location TEXT,
  address TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  -- AES-encrypted by the API with ENCRYPTION_KEY; never stored in the clear.
  signature TEXT,
  profile_pic_url TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMPTZ,
  push_token TEXT,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS petitions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  ask TEXT,
  image_url TEXT,
  category TEXT,
  organization TEXT,
  location TEXT,
  urgency TEXT DEFAULT 'medium',
  recipient TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  signature_goal INTEGER DEFAULT 100,
  current_signatures INTEGER DEFAULT 0,
  weekly_increase INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- petition_id has no foreign key: it may point at a seed or external petition
-- that does not exist as a row here.
CREATE TABLE IF NOT EXISTS signatures (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  petition_id TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, petition_id)
);

CREATE TABLE IF NOT EXISTS saved_petitions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  petition_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, petition_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  petition_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reporter_email TEXT,
  reported_item_type TEXT DEFAULT 'petition',
  reported_item_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signatures_petition ON signatures (petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_user ON signatures (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_petitions (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions (status);

-- Upgrades for databases created before these columns existed.
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_method TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS reporter_email TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE reports ALTER COLUMN reporter_id DROP NOT NULL;
ALTER TABLE reports ALTER COLUMN reported_item_id TYPE TEXT USING reported_item_id::TEXT;

-- Every table is reached only through the API, which authenticates with the
-- service_role key and therefore bypasses RLS. Turning RLS on with no policies
-- means the public anon key can read nothing, even if it leaks.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
