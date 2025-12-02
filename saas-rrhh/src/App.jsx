import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EmployeeList from './pages/EmployeeList'
import JobSettings from './pages/JobSettings'
import AbsenceManagement from './pages/AbsenceManagement'
import BalanceSettings from './pages/BalanceSettings'
import SubcontractorSettings from './pages/SubcontractorSettings';
import CourseSettings from './pages/CourseSettings';
import './index.css'

function App() {
  return (
    // Ahora sí proveemos el contexto que EmployeeList necesita
    <AuthProvider>
      <div className="font-sans text-slate-900">
        <BrowserRouter>
          <Routes>
            {/* Ruta principal: Lista de empleados */}
            <Route path="/" element={<EmployeeList />} /> 

            <Route path="/absences" element={<AbsenceManagement />} /> {/* <--- NUEVA RUTA */}
            <Route path="/settings/subcontractors" element={<SubcontractorSettings />} />
            <Route path="/settings/courses" element={<CourseSettings />} />
            <Route path="/settings/balances" element={<BalanceSettings />} /> {/* <--- NUEVA RUTA */}
            {/* RUTA DE CONFIGURACIÓN DE CARGOS */}
            <Route path="/settings/jobs" element={<JobSettings />} />
            
            <Route path="*" element={<EmployeeList />} /> 
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  )
}

export default App