import { createClient } from '@supabase/supabase-js'

// Leemos las variables de entorno que pusiste en .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let _supabase
if (!supabaseUrl || !supabaseAnonKey) {
	// Alternative: export a no-op proxy so imports don't throw, and we can provide
	// a clearer message where it's used.
	const handler = {
		get() {
			throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
		}
	}
	_supabase = new Proxy({}, handler)
} else {
	// Creamos la instancia de conexión
	_supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = _supabase