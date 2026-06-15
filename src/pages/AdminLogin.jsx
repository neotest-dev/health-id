import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getSupabaseClient } from '../lib/supabaseClient'
import { IconAdmin, IconAlert, IconEye, IconEyeOff, IconLock, IconUser } from '../components/Icons'

function AdminLogin() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, role } = useAuth()
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading || !isAuthenticated) {
      return
    }

    if (role === 'admin') {
      navigate('/admin', { replace: true })
      return
    }

    if (role === 'doctor') {
      navigate('/doctor/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate, role])

  function updateState(event) {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setAuthLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword(loginForm)

      if (authError) {
        throw authError
      }

      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'No se pudo iniciar sesion como administrador.')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-slate-800 bg-slate-900/60 p-6 shadow-xl sm:p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <IconAdmin className="h-5 w-5" />
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Administracion</p>
        </div>
        <h1 className="text-3xl font-black text-white">Ingreso del administrador</h1>
        <p className="text-sm leading-7 text-slate-300">
          Accede con tu cuenta administrativa para gestionar especialidades, medicos y citas del centro.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-slate-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconUser className="h-4 w-4 text-cyan-400" />
            Email admin
          </span>
          <input
            name="email"
            value={loginForm.email}
            onChange={updateState}
            placeholder="admin@healthid.org"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconLock className="h-4 w-4 text-cyan-400" />
            Contraseña
          </span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={updateState}
              placeholder="Ingresa la contraseña"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-4 pr-12 text-sm font-medium outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={authLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          <IconLock className="h-5 w-5 shrink-0" />
          <span>{authLoading ? 'Ingresando...' : 'Entrar como admin'}</span>
        </button>
      </form>
    </section>
  )
}

export default AdminLogin
