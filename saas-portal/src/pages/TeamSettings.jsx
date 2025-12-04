import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const TeamSettings = () => {
  const { user } = useAuth()
  const navigate = useNavigate() // Hook para navegar
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState([])
  const [invites, setInvites] = useState([])
  const [newEmail, setNewEmail] = useState('')
  const [myRole, setMyRole] = useState('')

  useEffect(() => {
    if (user) loadTeamData()
  }, [user])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const { data: myProfile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).single()
      setMyRole(myProfile.role)

      if (myProfile.organization_id) {
        const { data: members } = await supabase.from('profiles').select('id, full_name, role').eq('organization_id', myProfile.organization_id)
        setTeam(members || [])
        const { data: pending } = await supabase.from('organization_invites').select('*').eq('organization_id', myProfile.organization_id)
        setInvites(pending || [])
      }
    } catch (error) { console.error(error) } finally { setLoading(false) }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!newEmail) return
    try {
      const { data: myProfile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
      const { error } = await supabase.from('organization_invites').insert({ email: newEmail, organization_id: myProfile.organization_id, role: 'member' })
      if (error) throw error
      alert('Invitación enviada correctamente')
      setNewEmail('')
      loadTeamData()
    } catch (error) { alert('Error: ' + error.message) }
  }

  if (loading) return <div className="p-10 text-center">Cargando equipo...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado + Botón Retorno */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tu Equipo</h2>
            <p className="text-gray-500 mt-1">Gestiona quién tiene acceso a tu organización</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium shadow-sm transition-all"
          >
            ⬅ Volver al Dashboard
          </button>
        </div>

        {/* Sección de Invitación (Solo Admins) */}
        {myRole === 'admin' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 p-1 rounded">✉️</span> Invitar nuevo miembro
            </h3>
            <form onSubmit={handleInvite} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="colega@empresa.com" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors h-[42px]">
                Enviar Invitación
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              * El usuario recibirá acceso automático al registrarse con este correo.
            </p>
          </div>
        )}

        {/* Grid de Listas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Columna 1: Miembros Activos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-700">Miembros Activos ({team.length})</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {team.map(member => (
                <li key={member.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {member.full_name ? member.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-gray-900 font-medium">{member.full_name || 'Usuario sin nombre'}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 2: Invitaciones Pendientes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
              <h3 className="font-bold text-orange-800">Invitaciones Pendientes ({invites.length})</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {invites.length === 0 && (
                <li className="p-6 text-center text-gray-400 italic text-sm">No hay invitaciones enviadas</li>
              )}
              {invites.map(invite => (
                <li key={invite.id} className="p-4 flex justify-between items-center text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    ⏳ {invite.email}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    {invite.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

export default TeamSettings