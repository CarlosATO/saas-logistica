import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute' // <--- Importamos el guardia

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Si entra a la raíz, redirigir según estado (el Login se encargará de redirigir si ya está auth) */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* RUTA PROTEGIDA: Solo accesible si hay login */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App