import { useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import SigningOutOverlay from './SigningOutOverlay'
import { useAuth } from '../context/useAuth'
import { IconAdmin, IconCalendar, IconDoctor, IconHome, IconUser, IconLogout } from './Icons'

const publicLinks = [
  { to: '/', label: 'Inicio', icon: IconHome },
  { to: '/registrar', label: 'Registrar cita', icon: IconCalendar },
  { to: '/paciente/ver-cita', label: 'Ver mi cita', icon: IconUser },
  { to: '/doctor/login', label: 'Doctor', icon: IconDoctor },
  { to: '/admin/login', label: 'Admin', icon: IconAdmin },
]

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: IconDoctor },
  { to: '/doctor/perfil', label: 'Mi perfil', icon: IconUser },
]

const adminLinks = [
  { to: '/admin', label: 'Admin', icon: IconAdmin },
]

function Navbar() {
  const navigate = useNavigate()
  const { role, isAuthenticated, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const links = useMemo(() => {
    if (!isAuthenticated) {
      return publicLinks
    }

    if (role === 'doctor') {
      return doctorLinks
    }

    if (role === 'admin') {
      return adminLinks
    }

    return publicLinks
  }, [isAuthenticated, role])

  async function handleSignOut() {
    setIsOpen(false)

    try {
      setSigningOut(true)
      await signOut()
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      {signingOut && <SigningOutOverlay />}
      <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-7xl">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-3 shadow-lg shadow-slate-950/50 backdrop-blur-xl transition-all duration-300 md:p-4">
        <div className="flex items-center justify-between px-2">
          <NavLink to="/" className="group flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all duration-300 group-hover:scale-105 group-hover:bg-slate-800/80 group-hover:ring-cyan-400/40">
              <img src="/favicon.ico" className="relative z-10 h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110" alt="HealthID Logo" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white transition-colors duration-300 group-hover:text-cyan-300">
                HealthID
              </p>
              <p className="text-[10px] tracking-wide text-slate-400 transition-colors group-hover:text-slate-300">
                Criptografía & Reconocimiento Facial
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-1.5 md:flex">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `
                    relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300
                    ${isActive
                      ? 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_12px_rgba(6,182,212,0.1)]'
                      : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-white'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      {isActive && <span className="absolute -bottom-1 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
                    </>
                  )}
                </NavLink>
              )
            })}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all duration-300 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
              >
                <IconLogout className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 duration-300" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 transition hover:bg-slate-900 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

          {isOpen && (
          <nav className="animate-in mt-3 flex flex-col gap-1 rounded-xl border border-slate-800/80 bg-slate-950/80 p-2 duration-200 fade-in slide-in-from-top-2 md:hidden">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors
                    ${isActive
                      ? 'border-l-2 border-cyan-400 bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="group flex items-center gap-3 w-full rounded-lg px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-rose-400 hover:bg-rose-500/10"
              >
                <IconLogout className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 duration-300" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </nav>
          )}
        </div>
      </header>
    </>
  )
}

export default Navbar
