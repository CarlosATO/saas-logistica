import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminPanel = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState([])
  const [modules, setModules] = useState([])
  const [activeLicenses, setActiveLicenses] = useState({}) 

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single()
      if (!profile?.is_super_admin) {
        navigate('/dashboard')
        return
      }
      fetchData()
    }
    checkAdmin()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: orgsData } = await supabase.from('organizations').select('id, name, created_at').order('created_at', { ascending: false })
      setCompanies(orgsData || [])
      const { data: modsData } = await supabase.from('app_modules').select('*')
      setModules(modsData || [])
      const { data: licensesData } = await supabase.from('org_modules').select('organization_id, module_key, status')
      
      const licensesMap = {}
      licensesData?.forEach(item => {
        if (item.status === 'active') licensesMap[`${item.organization_id}_${item.module_key}`] = true
      })
      setActiveLicenses(licensesMap)
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const toggleModule = async (orgId, modKey, currentStatus) => {
    const compositeKey = `${orgId}_${modKey}`
    try {
      if (currentStatus) {
        await supabase.from('org_modules').delete().match({ organization_id: orgId, module_key: modKey })
        const newMap = { ...activeLicenses }; delete newMap[compositeKey]; setActiveLicenses(newMap)
      } else {
        await supabase.from('org_modules').insert({ organization_id: orgId, module_key: modKey, status: 'active' })
        setActiveLicenses({ ...activeLicenses, [compositeKey]: true })
      }
    } catch (error) { alert("Error actualizando módulo") }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando Panel Maestro...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado con Botón de Retorno */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-gray-500 mt-1">Gestión global de empresas y licencias</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium"
          >
            ⬅ Volver al Dashboard
          </button>
        </div>

        {/* Tabla de Datos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Fecha Alta</th>
                  {modules.map(mod => (
                    <th key={mod.key} className="px-6 py-4 text-center">
                      {mod.name}
                      <span className="block text-gray-400 font-normal mt-1 text-[10px]">${mod.base_price}/mo</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map(org => (
                  <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{org.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(org.created_at).toLocaleDateString()}</td>
                    
                    {modules.map(mod => {
                      const isActive = activeLicenses[`${org.id}_${mod.key}`]
                      return (
                        <td key={mod.key} className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleModule(org.id, mod.key, isActive)}
                            className={`
                              px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border
                              ${isActive 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' 
                                : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-600'
                              }
                            `}
                          >
                            {isActive ? 'ACTIVO' : 'INACTIVO'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel