import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  
  // Estados para guardar lo que escribe el usuario
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Maneja los cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // LA LÓGICA FUERTE
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      // 1. Registrar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName, // Esto va a metadata
            // avatar_url: '' (podríamos pedirlo después)
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No se pudo crear el usuario")

      // El usuario ya se creó. El trigger en la BD creó su perfil automáticamente.
      // Ahora necesitamos crear la ORGANIZACIÓN.
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: formData.companyName }])
        .select()
        .single() // Devuelve el objeto creado, no un array

      if (orgError) throw orgError

      const newOrgId = orgData.id

      // 3. Actualizar el perfil del usuario para vincularlo a la Org y hacerlo Admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          organization_id: newOrgId,
          role: 'admin' 
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // ¡ÉXITO TOTAL!
      setMsg('✅ Empresa registrada con éxito. Redirigiendo...')
      
      // Esperamos 2 segundos y mandamos al Dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error) {
      console.error(error)
      setMsg('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>🚀 Alta de Nueva Empresa</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label>Nombre de la Empresa</label>
          <input 
            type="text" name="companyName" required 
            placeholder="Ej. Tech Solutions"
            value={formData.companyName} onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>Tu Nombre Completo</label>
          <input 
            type="text" name="fullName" required 
            placeholder="Ej. Juan Pérez"
            value={formData.fullName} onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>Correo Electrónico</label>
          <input 
            type="email" name="email" required 
            placeholder="admin@empresa.com"
            value={formData.email} onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input 
            type="password" name="password" required 
            placeholder="******"
            value={formData.password} onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Registrando...' : 'Registrar Empresa'}
        </button>

      </form>

      {msg && <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>{msg}</p>}

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login">¿Ya tienes cuenta? Ingresa aquí</Link>
      </div>
    </div>
  )
}

export default Register