// src/lib/supabaseClient.js
//
// Browser-side Supabase client. Uses the ANON key, which is designed to ship in
// the browser — your RLS policies (public read on hadiths / machine_clauses)
// are what actually keep it safe, not secrecy of this key.
//
// This is what lets search run with no API route: the query goes straight from
// the browser to Postgres via rpc().
//
// Needs two env vars in .env.local (NEXT_PUBLIC_ so they reach the browser):
//   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
// Both are in Supabase → Project Settings → API. The anon key, NOT service_role.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // A loud, early failure beats a silent "no results" if the env vars are missing.
  console.error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url, anonKey);