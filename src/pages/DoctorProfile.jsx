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
    <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <IconDoctor className="w-5 h-5" />
          <p className="text-xs uppercase tracking-[0.3em] font-bold">{profileComplete ? 'Perfil profesional' : 'Configuracion inicial'}</p>
        </div>
        <h1 className="text-3xl font-black text-white">Perfil del doctor</h1>
        <p className="text-sm leading-7 text-slate-300 font-medium">
          {profileComplete
            ? 'Actualiza tus datos profesionales o cambia tu contrasena cuando lo necesites.'
            : 'Completa tus datos y cambia la contrasena temporal para operar de forma segura.'}
        </p>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSave}>
        <label className="space-y-2 text-sm text-slate-200 block">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconUser className="w-4 h-4 text-cyan-400" />
            Nombre completo
          </span>
          <input 
            name="fullName" 
            value={form.fullName} 
            onChange={updateField} 
            required 
            placeholder="Ej: Dr. Alejandro Ramos"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium" 
          />
        </label>
        
        <label className="space-y-2 text-sm text-slate-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconSpecialty className="w-4 h-4 text-cyan-400" />
            Especialidad
          </span>
          <select 
            name="especialidadId" 
            value={form.especialidadId} 
            onChange={updateField} 
            required 
            disabled
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-sm outline-none transition cursor-not-allowed font-medium text-slate-500"
          >
            <option value="">Selecciona una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
            ))}
          </select>
        </label>
        
        <label className="space-y-2 text-sm text-slate-200 block">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconKey className="w-4 h-4 text-cyan-400" />
            Nueva contraseña
          </span>
          <input 
            name="newPassword" 
            type="password" 
            value={form.newPassword} 
            onChange={updateField} 
            placeholder="Mínimo 8 caracteres" 
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium" 
          />
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving} 
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-400 px-4 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
        >
          <IconCheck className="w-5 h-5 shrink-0" />
          <span>{saving ? 'Guardando...' : (profileComplete ? 'Actualizar perfil' : 'Guardar perfil')}</span>
        </button>
      </form>
    </section>
  )
}

export default DoctorProfile
