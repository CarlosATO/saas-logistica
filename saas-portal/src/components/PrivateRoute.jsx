import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Mientras Supabase verifica si hay sesión, podemos mostrar un "Cargando..."
  // para evitar parpadeos extraños.
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sesión...</div>
  }

  // Si ya terminó de cargar y NO hay usuario, patada al Login
  if (!user) {
    return <Navigate to="/login" />
  }

  // Si hay usuario, renderizamos la página protegida (Dashboard)
  return children
}

export default PrivateRoute