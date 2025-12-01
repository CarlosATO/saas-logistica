import { createClient } from '@supabase/supabase-js'

// Leemos las variables de entorno que pusiste en .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Creamos la instancia de conexión
export const supabase = createClient(supabaseUrl, supabaseAnonKey)