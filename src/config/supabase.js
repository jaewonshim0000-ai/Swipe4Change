// Supabase Configuration
// Replace with your Supabase project credentials from:
// https://supabase.com/dashboard → Project → Settings → API
//
// Setup steps:
// 1. Create a project at supabase.com
// 2. Go to Settings → API to get URL and anon key
// 3. Create tables using the SQL in backend/schema.sql

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const SUPABASE_ENABLED =
  SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co';
