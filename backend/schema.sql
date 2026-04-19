-- Swipe4Change — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

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
  push_token TEXT,
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  reporter_id UUID NOT NULL REFERENCES users(id),
  reported_item_type TEXT NOT NULL,
  reported_item_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
