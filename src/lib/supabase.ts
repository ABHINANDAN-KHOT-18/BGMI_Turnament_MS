import { createClient } from '@supabase/supabase-js'

// Support both standard VITE_SUPABASE_PUBLISHABLE_KEY and backward-compatible VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-placeholder.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'demo-publishable-key'

export const isSupabaseConfigured =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('demo-placeholder')

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
