import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { getSupabaseClient } from '../lib/supabaseClient'
import { 
  IconDoctor, 
  IconUser, 
  IconSpecialty, 
  IconKey, 
  IconAlert, 
  IconCheck 
} from '../components/Icons'

function DoctorProfile() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileComplete, setProfileComplete] = useState(false)
  const [especialidades, setEspecialidades] = useState([])
  const [form, setForm] = useState({ fullName: '', especialidadId: '', newPassword: '' })

  useEffect(() => {
    async function loadProfile() {
      try {
        const accessToken = session?.access_token

        if (!accessToken) {
          navigate('/doctor/login')
          return
        }

        setToken(accessToken)
        const data = await apiRequest('/api/doctor/mi-perfil', { token: accessToken })

        const hasCompletedProfile = Boolean(
          data.profile?.full_name && data.details?.especialidad_id,
        )
        setProfileComplete(hasCompletedProfile)

        setEspecialidades(data.especialidades || [])
        setForm({
          fullName: data.profile?.full_name || '',
          especialidadId: data.details?.especialidad_id || '',
          newPassword: '',
        })
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate, session])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await apiRequest('/api/doctor/mi-perfil', {
        method: 'POST',
        token,
        body: {
          fullName: form.fullName,
          especialidadId: form.especialidadId,
          newPassword: form.newPassword,
        },
      })

      if (form.newPassword) {
        const supabase = getSupabaseClient()
        const { error: authError } = await supabase.auth.updateUser({ password: form.newPassword })

        if (authError) {
          throw authError
        }
      }

      setProfileComplete(true)
      setSuccess(profileComplete ? 'Perfil actualizado correctamente.' : 'Perfil actualizado. Ya puedes entrar al dashboard medico.')
      setForm((current) => ({ ...current, newPassword: '' }))

      if (!profileComplete) {
        navigate('/doctor/dashboard')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Spinner centered label="Cargando tu información" description="Estamos revisando tu perfil profesional y la configuración de tu cuenta." />
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-teal-700">
          <IconDoctor className="w-5 h-5" />
          <p className="text-xs uppercase tracking-[0.3em] font-bold">{profileComplete ? 'Perfil profesional' : 'Configuracion inicial'}</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Perfil del doctor</h1>
        <p className="text-sm font-medium leading-7 text-slate-600">
          {profileComplete
            ? 'Actualiza tus datos profesionales o cambia tu contrasena cuando lo necesites.'
            : 'Completa tus datos y cambia la contrasena temporal para operar de forma segura.'}
        </p>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSave}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconUser className="w-4 h-4 text-teal-600" />
            Nombre completo
          </span>
          <input 
            name="fullName" 
            value={form.fullName} 
            onChange={updateField} 
            required 
            placeholder="Ej: Dr. Alejandro Ramos"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" 
          />
        </label>
        
        <label className="space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconSpecialty className="w-4 h-4 text-teal-600" />
            Especialidad
          </span>
          <select 
            name="especialidadId" 
            value={form.especialidadId} 
            onChange={updateField} 
            required 
            disabled
            className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-medium text-slate-500 outline-none transition-colors"
          >
            <option value="">Selecciona una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
            ))}
          </select>
        </label>
        
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconKey className="w-4 h-4 text-teal-600" />
            Nueva contraseña
          </span>
          <input 
            name="newPassword" 
            type="password" 
            value={form.newPassword} 
            onChange={updateField} 
            placeholder="Nueva contraseña" 
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" 
          />
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <IconCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving} 
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
        >
          <IconCheck className="w-5 h-5 shrink-0" />
          <span>{saving ? 'Guardando...' : (profileComplete ? 'Actualizar perfil' : 'Guardar perfil')}</span>
        </button>
      </form>
    </section>
  )
}

export default DoctorProfile
