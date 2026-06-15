import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/useAuth'
import { doctorEmailFromDni } from '../lib/api'
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

      navigate('/doctor/perfil')
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
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <IconDoctor className="w-5 h-5" />
          <p className="text-xs uppercase tracking-[0.3em] font-bold">Portal médico</p>
        </div>
        <h1 className="text-3xl font-black text-white">Ingreso del médico</h1>
        <p className="text-sm leading-7 text-slate-300">
          Usa tu DNI como usuario. En el alta inicial el password temporal también es el DNI.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="space-y-2 text-sm text-slate-200 block">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconShield className="w-4 h-4 text-cyan-400" />
            DNI / Usuario
          </span>
          <input 
            value={dni} 
            onChange={(event) => setDni(event.target.value)} 
            placeholder="Ej: 71593668" 
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium" 
          />
        </label>
        
        <label className="space-y-2 text-sm text-slate-200 block">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconLock className="w-4 h-4 text-cyan-400" />
            Contraseña
          </span>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-4 pr-12 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-400 px-4 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
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
