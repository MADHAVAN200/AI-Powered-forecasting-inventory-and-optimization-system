
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase Client: Missing URL or Anon Key', { url: supabaseUrl, key: !!supabaseAnonKey });
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
