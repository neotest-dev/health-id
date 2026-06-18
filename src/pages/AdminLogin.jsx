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
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-teal-700">
          <IconAdmin className="h-5 w-5" />
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Administracion</p>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Ingreso del administrador</h1>
        <p className="text-sm leading-7 text-slate-600">
          Accede con tu cuenta administrativa para gestionar especialidades, medicos y citas del centro.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconUser className="h-4 w-4 text-teal-600" />
            Email admin
          </span>
          <input
            name="email"
            value={loginForm.email}
            onChange={updateState}
            placeholder="admin@healthid.org"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center gap-1.5 font-semibold">
            <IconLock className="h-4 w-4 text-teal-600" />
            Contraseña
          </span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={updateState}
              placeholder="Ingresa la contraseña"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-12 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-100"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
            </button>
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={authLoading}
          className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
        >
          <IconLock className="h-5 w-5 shrink-0" />
          <span>{authLoading ? 'Ingresando...' : 'Entrar como admin'}</span>
        </button>
      </form>
    </section>
  )
}

export default AdminLogin
