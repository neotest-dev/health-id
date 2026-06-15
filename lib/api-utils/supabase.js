import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('HealthID API: faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
}

export const adminSupabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export const publicSupabase = supabaseUrl && anonKey
  ? createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export function getAdminSupabase() {
  if (!adminSupabase) {
    throw new Error('Configura las variables de entorno de Supabase antes de usar la API.')
  }

  return adminSupabase
}
