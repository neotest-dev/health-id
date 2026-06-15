import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacialScanner from '../components/FacialScanner'
import SigningOutOverlay from '../components/SigningOutOverlay'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { 
  IconDoctor, 
  IconCalendar, 
  IconUser, 
  IconClock, 
  IconShield, 
  IconKey, 
  IconAlert, 
  IconCheck, 
  IconLogout,
  IconBlood,
  IconSpecialty,
  IconInfo
} from '../components/Icons'

function reportBackendTimings(response) {
  if (!import.meta.env.DEV) {
    return
  }

  const timings = {
    verifyJwt: response.headers.get('x-healthid-auth-verify-jwt'),
    loadProfile: response.headers.get('x-healthid-auth-load-profile'),
    authTotal: response.headers.get('x-healthid-auth-total'),
    parallelQueries: response.headers.get('x-healthid-dashboard-parallel-queries'),
    total: response.headers.get('x-healthid-dashboard-total'),
  }

  if (Object.values(timings).every((value) => value === null)) {
    return
  }

  console.info(
    `[timing] doctor.dashboard.backend verify-jwt=${timings.verifyJwt || 'n/a'}ms load-profile=${timings.loadProfile || 'n/a'}ms auth-total=${timings.authTotal || 'n/a'}ms parallel-queries=${timings.parallelQueries || 'n/a'}ms total=${timings.total || 'n/a'}ms`,
  )
}

function DoctorDashboard() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [dni, setDni] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [verification, setVerification] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      const startedAt = performance.now()

      try {
        const accessToken = session?.access_token

        if (!accessToken) {
          navigate('/doctor/login')
          return
        }

        setToken(accessToken)
        const data = await apiRequest('/api/doctor/ver-mis-pacientes', {
          token: accessToken,
          onResponse: reportBackendTimings,
        })
        setDashboard(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        if (import.meta.env.DEV) {
          console.info(`[timing] doctor.dashboard-load: ${Math.round(performance.now() - startedAt)}ms`)
        }
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate, session])

  async function handleVerify() {
    setError('')
    setVerification(null)

    if (!dni || !descriptor) {
      setError('Ingresa el DNI del paciente y captura su rostro.')
      return
    }

    setVerifying(true)

    try {
      const data = await apiRequest('/api/verificar-rostro', {
        method: 'POST',
        token,
        body: { dni, descriptorFacial: descriptor },
      })
      setVerification(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setVerifying(false)
    }
  }

  async function handleSignOut() {
    try {
      setSigningOut(true)
      await signOut()
      navigate('/doctor/login')
    } finally {
      setSigningOut(false)
    }
  }

  const formatDate = (value) => {
    if (!value) {
      return 'Sin fecha'
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString()
  }

  if (loading) {
    return <DoctorDashboardSkeleton />
  }

  return (
    <>
      {signingOut && <SigningOutOverlay detail="Estamos cerrando tu sesion medica y bloqueando el acceso al expediente." />}
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      {/* Left panel: Info & list of appointments */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <IconDoctor className="w-5 h-5 animate-pulse" />
                <p className="text-xs uppercase tracking-[0.3em] font-bold">Dashboard médico</p>
              </div>
              <h1 className="mt-2 text-3xl font-black text-white">{dashboard?.doctor?.fullName || 'Doctor'}</h1>
              <p className="mt-1.5 text-sm text-slate-400 font-medium">
                {dashboard?.doctor?.especialidad || 'Sin especialidad'} · turno {dashboard?.doctor?.turno || 'pendiente'}
              </p>
            </div>
            <button 
              type="button" 
              onClick={handleSignOut} 
              className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10"
            >
              <IconLogout className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 duration-300" />
              <span>Cerrar sesión</span>
            </button>
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid gap-4 grid-cols-3">
            <Stat label="Asignadas" value={String(dashboard?.summary?.total || 0)} icon={IconCalendar} color="text-cyan-400 border-cyan-500/10 bg-cyan-500/5" />
            <Stat label="Programadas" value={String(dashboard?.summary?.pendientes || 0)} icon={IconClock} color="text-amber-400 border-amber-500/10 bg-amber-500/5" />
            <Stat label="Atendidas" value={String(dashboard?.summary?.atendidas || 0)} icon={IconCheck} color="text-emerald-400 border-emerald-500/10 bg-emerald-500/5" />
          </div>

          <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <IconClock className="w-5 h-5 text-cyan-400" />
                Agenda programada
              </h2>
            <div className="space-y-3">
              {dashboard?.citas?.length ? dashboard.citas.map((cita) => (
                <article key={cita.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300 hover:border-slate-750 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                       <p className="font-semibold text-white tracking-wide">{cita.codigo}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                          <IconSpecialty className="w-3.5 h-3.5 text-slate-600" />
                          {cita.especialidad}
                        </p>
                      </div>
                    <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {cita.estado}
                    </span>
                  </div>
                   <p className="mt-3.5 text-[11px] text-slate-500 font-mono">Fecha: {formatDate(cita.fecha_cita)}</p>
                </article>
              )) : (
                <p className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-6 text-sm text-slate-400 text-center font-medium">
                  Aun no tienes citas asignadas.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right panel: Scanner and unlock */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <IconShield className="w-5 h-5" />
              <p className="text-xs uppercase tracking-[0.3em] font-bold">Desbloqueo de expediente</p>
            </div>
            <h2 className="text-2xl font-bold text-white">Validar identidad del paciente</h2>
            <p className="text-sm leading-7 text-slate-300">
              Introduce el DNI del paciente y escanea su rostro. Si coincide, el sistema descifra el historial clínico.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm text-slate-200 block">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconShield className="w-4 h-4 text-cyan-400" />
                DNI del paciente
              </span>
              <input 
                value={dni} 
                onChange={(event) => setDni(event.target.value)} 
                placeholder="Escribe el DNI del paciente"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium" 
              />
            </label>

            <button 
              type="button" 
              onClick={handleVerify} 
              disabled={verifying} 
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
            >
              <IconKey className="w-5 h-5 shrink-0" />
              <span>{verifying ? 'Verificando...' : 'Desbloquear expediente'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {verification && (
            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 shadow-inner">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold">Datos clínicos desbloqueados</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Éxito
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoItem label="Nombre" value={verification.paciente.nombre} icon={IconUser} />
                <InfoItem label="Edad" value={`${verification.paciente.edad} años`} icon={IconClock} />
                <InfoItem label="Tipo de sangre" value={verification.paciente.tipoSangre} icon={IconBlood} />
                <InfoItem label="Estado de cita" value={verification.cita.estado} icon={IconShield} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold flex items-center gap-1.5 mb-1">
                  <IconAlert className="w-4 h-4 text-emerald-400" />
                  Alergias
                </p>
                <p className="text-white bg-slate-950/20 p-3 rounded-xl border border-emerald-400/10">{verification.paciente.alergias}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold flex items-center gap-1.5 mb-1">
                  <IconInfo className="w-4 h-4 text-emerald-400" />
                  Síntomas
                </p>
                <p className="text-white bg-slate-950/20 p-3 rounded-xl border border-emerald-400/10">{verification.paciente.sintomas}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <FacialScanner onDescriptorCaptured={setDescriptor} buttonLabel="Capturar rostro del paciente" />
        </div>
      </section>
      </div>
    </>
  )
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-200 ${color}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-slate-950/30 p-3 flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-emerald-400 shrink-0" />}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default DoctorDashboard

function DoctorDashboardSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] animate-pulse">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full bg-cyan-400/15" />
            <div className="h-10 w-72 rounded-2xl bg-slate-800" />
            <div className="h-4 w-56 rounded-full bg-slate-800" />
          </div>
          <div className="h-11 w-36 rounded-full bg-slate-800" />
        </div>

        <div className="mt-8 grid gap-4 grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="h-3 w-24 rounded-full bg-slate-800" />
              <div className="mt-4 h-10 w-16 rounded-xl bg-slate-800" />
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-7 w-44 rounded-xl bg-slate-800" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-5 w-32 rounded-lg bg-slate-800" />
                    <div className="h-3 w-24 rounded-full bg-slate-800" />
                  </div>
                  <div className="h-7 w-20 rounded-full bg-slate-800" />
                </div>
                <div className="mt-4 h-3 w-36 rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
        <div className="space-y-3">
          <div className="h-3 w-40 rounded-full bg-slate-800" />
          <div className="h-8 w-64 rounded-2xl bg-slate-800" />
          <div className="h-4 w-full rounded-full bg-slate-800" />
          <div className="h-4 w-4/5 rounded-full bg-slate-800" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-slate-800" />
            <div className="h-12 w-full rounded-2xl bg-slate-800" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-slate-800" />
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="aspect-[4/3] w-full rounded-[1.5rem] bg-slate-800" />
          </div>
        </div>
      </section>
    </div>
  )
}
