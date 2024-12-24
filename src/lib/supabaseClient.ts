import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://sptgqxscdunmpkyemepx.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwdGdxeHNjZHVubXBreWVtZXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwODYxODYsImV4cCI6MjA0MzY2MjE4Nn0.mLUCAxL-NSu8bl-05DCpCMtr5jnDHUPiA4LpJsSnsqQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)