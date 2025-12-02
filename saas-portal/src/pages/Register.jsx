import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.fullName } }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No se pudo crear el usuario")

      // Esperar al trigger
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authData.user.id)
        .single()

      if (profile && profile.organization_id) {
        setMsg('👋 ¡Te detectamos una invitación! Te uniste a tu equipo existente.')
      } else {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert([{ name: formData.companyName }])
          .select()
          .single()

        if (orgError) throw orgError

        await supabase
          .from('profiles')
          .update({ organization_id: orgData.id, role: 'admin' })
          .eq('id', authData.user.id)

        setMsg('✅ Empresa registrada con éxito.')
      }

      setTimeout(() => navigate('/dashboard'), 2000)

    } catch (error) {
      console.error(error)
      setMsg('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden p-8 space-y-6">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Crear Cuenta</h2>
          <p className="mt-2 text-sm text-gray-600">Comienza a gestionar tu empresa hoy</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
            <input 
              type="text" name="companyName" required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej. Tech Solutions"
              value={formData.companyName} onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">* Si tienes invitación, este nombre se ignorará.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input 
              type="text" name="fullName" required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.fullName} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input 
              type="email" name="email" required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.email} onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" name="password" required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formData.password} onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
            {loading ? 'Procesando...' : 'Registrar Empresa'}
          </button>

        </form>

        {msg && (
          <div className={`p-3 rounded text-center text-sm font-bold ${msg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {msg}
          </div>
        )}

        <div className="text-center text-sm">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            ¿Ya tienes cuenta? Ingresa aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register