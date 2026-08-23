import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true kalau .env sudah diisi — dipakai api.js untuk memilih sumber data */
export const supabaseSiap = Boolean(url && anonKey)

export const supabase = supabaseSiap ? createClient(url, anonKey) : null

if (!supabaseSiap && import.meta.env.DEV) {
  console.info(
    '[LARIS] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi — aplikasi jalan pakai data dummy dari src/data/dummy.js',
  )
}
