import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx' // <--- Importante

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const root = createRoot(document.getElementById('root'))

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // Render a helpful message instead of letting the app crash with a low-level error
  root.render(
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#dc2626' }}>⚠️ Faltan variables de entorno</h1>
      <p>Para correr esta app localmente debes crear <code>.env.local</code> con tus datos de Supabase.</p>
      <p>Ejemplo: copia <code>.env.local.example</code> y rellena <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>.</p>
      <p>Luego reinicia el servidor dev: <code>npm run dev</code>.</p>
    </div>
  )
} else {
  root.render(
    <StrictMode>
      <AuthProvider>  {/* <--- Abrazo de inicio */}
        <App />
      </AuthProvider> {/* <--- Abrazo de fin */}
    </StrictMode>,
  )
}