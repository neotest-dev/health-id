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
      <header className="animate-nav-drop sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-7xl">
        <div className="group/nav relative overflow-hidden rounded-3xl border border-teal-100 bg-white/90 p-3 shadow-xl shadow-teal-950/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-950/15 md:p-4">
        <div className="animate-nav-shine pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent opacity-0 transition-opacity duration-300 group-hover/nav:opacity-100" />
        <div className="flex items-center justify-between px-2">
          <NavLink to="/" className="group flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-teal-50 ring-1 ring-teal-100 transition-all duration-300 group-hover:-rotate-3 group-hover:bg-teal-100 group-hover:ring-teal-300 group-hover:shadow-lg group-hover:shadow-teal-600/15">
              <span className="animate-logo-orbit absolute h-9 w-9 rounded-full border border-dashed border-teal-300/70" />
              <img src="/favicon.ico" className="relative z-10 h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" alt="HealthID Logo" />
              <div className="absolute -inset-0.5 rounded-xl bg-teal-500/10 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-950 transition-colors duration-200 group-hover:text-teal-700">
                HealthID
              </p>
              <p className="text-[10px] tracking-wide text-slate-500 transition-colors group-hover:text-slate-700">
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
                    group/link relative flex items-center gap-2 overflow-hidden rounded-2xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-100
                    ${isActive
                      ? 'border border-teal-200 bg-teal-50 text-teal-700 shadow-sm'
                      : 'border border-transparent text-slate-600 hover:border-teal-100 hover:bg-teal-50 hover:text-teal-800'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-500 group-hover/link:translate-x-full group-hover/link:opacity-100" />
                      <Icon className="relative h-4 w-4 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:rotate-3" />
                      <span>{link.label}</span>
                      <span className={`absolute bottom-1 left-4 right-4 h-[2px] origin-left rounded-full bg-emerald-500 transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover/link:scale-x-100'}`} />
                    </>
                  )}
                </NavLink>
              )
            })}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 hover:shadow-lg hover:shadow-rose-500/10 focus:outline-none focus:ring-4 focus:ring-rose-100"
              >
                <IconLogout className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 duration-300" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-100 hover:shadow-lg hover:shadow-teal-600/10 focus:outline-none focus:ring-4 focus:ring-teal-100 md:hidden"
            aria-label="Abrir menú"
          >
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

          {isOpen && (
          <nav className="animate-modal-in mt-3 flex flex-col gap-1 rounded-2xl border border-teal-100 bg-white p-2 shadow-lg shadow-teal-950/10 md:hidden">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    group/mobile relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:translate-x-1 focus:outline-none focus:ring-4 focus:ring-teal-100
                    ${isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
                    }
                  `}
                >
                  <span className="absolute inset-y-2 left-0 w-1 origin-y scale-y-0 rounded-full bg-emerald-500 transition-transform duration-200 group-hover/mobile:scale-y-100" />
                  <Icon className="h-4 w-4 transition-transform duration-200 group-hover/mobile:rotate-6" />
                  <span>{link.label}</span>
                </NavLink>
              )
            })}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSignOut}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
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
