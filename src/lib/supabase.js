import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcsmhjwtgaumtpcdowgc.supabase.co'
// IMPORTANT: Replace this with your actual Supabase anon key from your project settings
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc21oand0Z2F1bXRwY2Rvd2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDQxNDgsImV4cCI6MjA3NTUyMDE0OH0.135T-9s4Csh4JZSGm77MoBT_CIGuSkddGG1nf_vQ2A8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table schemas (for reference)
export const TABLES = {
  USERS: 'users',
  PROFILES: 'profiles',
  CHARGING_STATIONS: 'charging_stations',
  BOOKINGS: 'bookings'
}

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  HOSTER: 'hoster'
}
