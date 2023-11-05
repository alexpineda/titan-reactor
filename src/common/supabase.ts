import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://dypueayfjieyijupqhei.supabase.co";
export const SUPABASE_PUBLIC_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5cHVlYXlmamlleWlqdXBxaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc3NTA0OTQsImV4cCI6MjAxMzMyNjQ5NH0.mn3PKMcsP4yqPpb-BQmEJn4mBIHLAZ0re7g3n9Ni8cQ";

export const supabase = createClient( SUPABASE_URL, SUPABASE_PUBLIC_ANON_KEY );

export const SUPABASE_REPLAY_BUCKET = `${SUPABASE_URL}/storage/v1/object/public/replays/`;