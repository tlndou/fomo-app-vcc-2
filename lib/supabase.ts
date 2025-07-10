import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug environment variables
console.log('🔧 Environment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')

// Create the appropriate client based on environment variables
let supabaseClient: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables! Using mock client for development.')
  
  // Create a mock Supabase client for development
  const mockSupabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
      signUp: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      updateUser: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }) }) }),
      insert: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
      update: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
      delete: async () => ({ data: null, error: new Error('Mock: No Supabase configured') }),
    }),
  }
  
  supabaseClient = mockSupabase
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient