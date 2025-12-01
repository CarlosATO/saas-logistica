import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Importamos el contexto

const Login = () => {
  const navigate = useNavigate()
  const { user } = useAuth() // Obtenemos el usuario actual del contexto

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 1. REDIRECCIÓN INTELIGENTE
  // Si el usuario YA existe (está logueado), lo mandamos al Dashboard
  // y no le dejamos ver la pantalla de login.
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // 2. Lógica de Supabase para iniciar sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Si todo sale bien, el AuthContext detectará el cambio automáticamente
      // y la redirección del useEffect de arriba o del propio estado nos llevará,
      // pero para forzarlo rápido:
      navigate('/dashboard')

    } catch (error) {
      setErrorMsg('❌ Credenciales incorrectas o error de conexión')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>🔑 Iniciar Sesión</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Correo Electrónico</label>
          <input 
            type="email" 
            required 
            value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Contraseña</label>
          <input 
            type="password" 
            required 
            value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        {errorMsg && <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '12px', 
            background: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontSize: '16px' 
          }}
        >
          {loading ? 'Ingresando...' : 'Entrar al Portal'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        ¿No tienes cuenta? <Link to="/register" style={{ color: '#007bff' }}>Registra tu empresa aquí</Link>
      </div>
    </div>
  )
}

export default Login