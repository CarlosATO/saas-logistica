import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [companyName, setCompanyName] = useState('Cargando empresa...')

  // Función para cerrar sesión
  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  useEffect(() => {
    if (!user) return

    // Buscar datos del perfil y la empresa
    const fetchProfileData = async () => {
      try {
        // 1. Traemos el perfil del usuario logueado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, organization_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // 2. Si tiene empresa, buscamos el nombre
        if (profileData.organization_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', profileData.organization_id)
            .single()
          
          if (orgError) throw orgError
          setCompanyName(orgData.name)
        }
      } catch (error) {
        console.error('Error cargando datos:', error.message)
      }
    }

    fetchProfileData()
  }, [user])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      
      {/* Header simple */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>📊 Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '4px' }}>
          Cerrar Sesión
        </button>
      </div>

      {/* Tarjeta de Bienvenida */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2>🏢 {companyName}</h2>
        <p><strong>Usuario:</strong> {profile?.full_name || user.email}</p>
        <p><strong>ID de Empresa:</strong> {profile?.organization_id}</p>
        <hr />
        <p>Bienvenido al panel de control. Aquí cargarán tus módulos.</p>
      </div>

    </div>
  )
}

export default Dashboard