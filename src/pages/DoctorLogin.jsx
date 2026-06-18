import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/useAuth'
import { apiRequest, doctorEmailFromDni } from '../lib/api'
import { getSupabaseClient } from '../lib/supabaseClient'
import { IconDoctor, IconShield, IconLock, IconAlert, IconEye, IconEyeOff } from '../components/Icons'

function DoctorLogin() {
  const navigate = useNavigate()
  const { setOptimisticProfile } = useAuth()
  const [dni, setDni] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const startedAt = performance.now()

    try {
      const supabase = getSupabaseClient()
      const email = doctorEmailFromDni(dni)
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        throw authError
      }

      const normalizedDni = String(dni).trim().split('@')[0]

      setOptimisticProfile({
        id: data.session.user.id,
        dni: normalizedDni,
        full_name: data.session.user.user_metadata?.full_name || null,
        role: 'doctor',
      })

      const profileData = await apiRequest('/api/doctor/mi-perfil', {
        token: data.session.access_token,
      })
      const hasCompletedProfile = Boolean(
        profileData.profile?.full_name && profileData.details?.especialidad_id,
      )

      navigate(hasCompletedProfile ? '/doctor/dashboard' : '/doctor/perfil')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesión.')
    } finally {
      if (import.meta.env.DEV) {
        console.info(`[timing] doctor.login-flow: ${Math.round(performance.now() - startedAt)}ms`)
      }
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-teal-700">
          <IconDoctor className="w-5 h-5" />
          <p className="text-xs uppercase tracking-[0.3em] font-bold">Portal médico</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Ingreso del médico</h1>
        <p className="text-sm leading-7 text-slate-600">
          Usa tu DNI como usuario. En el alta inicial el password temporal también es el DNI.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconShield className="w-4 h-4 text-teal-600" />
            DNI / Usuario
          </span>
          <input 
            value={dni} 
            onChange={(event) => setDni(event.target.value)} 
            placeholder="Ej: 71593668" 
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" 
          />
        </label>
        
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconLock className="w-4 h-4 text-teal-600" />
            Contraseña
          </span>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
        >
          <IconLock className="w-5 h-5 shrink-0" />
          <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
        </button>
        
        {loading && (
          <div className="flex justify-center pt-2">
            <Spinner compact label="Iniciando sesión segura..." />
          </div>
        )}
      </form>
    </section>
  )
}

export default DoctorLogin
