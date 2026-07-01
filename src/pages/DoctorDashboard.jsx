import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacialScanner from '../components/FacialScanner'
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
  const { session } = useAuth()
  const token = session?.accessToken
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState(null)
  const [dni, setDni] = useState('')
  const [descriptor, setDescriptor] = useState(null)

  useEffect(() => {
    if (!session) {
      navigate('/doctor/login')
      return
    }

    async function loadDashboard() {
      const accessToken = session.accessToken
      const startedAt = performance.now()

      try {
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
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-2xl shadow-teal-950/10">
        <div className="bg-teal-950 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-teal-200">
                <IconDoctor className="w-5 h-5" />
                <p className="text-xs uppercase tracking-[0.3em] font-bold">Dashboard médico</p>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{dashboard?.doctor?.fullName || 'Doctor'}</h1>
              <p className="mt-2 text-sm font-semibold text-teal-100/80">
                {dashboard?.doctor?.especialidad || 'Sin especialidad'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
        <div>
          <div className="grid gap-4 grid-cols-3">
            <Stat label="Asignadas" value={String(dashboard?.summary?.total || 0)} icon={IconCalendar} color="text-teal-700 border-teal-100 bg-teal-50" />
            <Stat label="Programadas" value={String(dashboard?.summary?.pendientes || 0)} icon={IconClock} color="text-amber-700 border-amber-100 bg-amber-50" />
            <Stat label="Atendidas" value={String(dashboard?.summary?.atendidas || 0)} icon={IconCheck} color="text-emerald-700 border-emerald-100 bg-emerald-50" />
          </div>

          <div className="mt-8 space-y-4">
              <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
                <IconClock className="w-5 h-5 text-teal-600" />
                Agenda programada
              </h2>
            <div className="space-y-3">
              {dashboard?.citas?.length ? dashboard.citas.map((cita) => (
                <article key={cita.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm transition-colors duration-200 hover:border-teal-200 hover:bg-teal-50/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                       <p className="font-black text-slate-950 tracking-wide">{cita.codigo}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                          <IconSpecialty className="w-3.5 h-3.5 text-teal-600" />
                          {cita.especialidad}
                        </p>
                      </div>
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      {cita.estado}
                    </span>
                  </div>
                   <p className="mt-3.5 text-[11px] text-slate-500 font-mono">Fecha: {formatDate(cita.fecha_cita)}</p>
                </article>
              )) : (
                <p className="rounded-2xl border border-dashed border-teal-200 bg-teal-50 px-4 py-6 text-sm text-teal-700 text-center font-semibold">
                  Aun no tienes citas asignadas.
                </p>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="flex flex-col justify-between rounded-[2rem] border border-teal-100 bg-white/95 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
        <div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-700">
              <IconShield className="w-5 h-5" />
              <p className="text-xs uppercase tracking-[0.3em] font-bold">Desbloqueo de expediente</p>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Validar identidad del paciente</h2>
            <p className="text-sm leading-7 text-slate-600">
              Introduce el DNI del paciente y escanea su rostro. Si coincide, el sistema descifra el historial clínico.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm text-slate-700 block">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconShield className="w-4 h-4 text-teal-600" />
                DNI del paciente
              </span>
              <input 
                value={dni} 
                onChange={(event) => setDni(event.target.value)} 
                placeholder="Escribe el DNI del paciente"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" 
              />
            </label>

            <button 
              type="button" 
              onClick={handleVerify} 
              disabled={verifying} 
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              <IconKey className="w-5 h-5 shrink-0" />
              <span>{verifying ? 'Verificando...' : 'Desbloquear expediente'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {verification && (
            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-inner">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold">Datos clínicos desbloqueados</span>
                <span className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
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
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold flex items-center gap-1.5 mb-1">
                  <IconAlert className="w-4 h-4 text-emerald-600" />
                  Alergias
                </p>
                <p className="text-slate-800 bg-white p-3 rounded-xl border border-emerald-100">{verification.paciente.alergias}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold flex items-center gap-1.5 mb-1">
                  <IconInfo className="w-4 h-4 text-emerald-600" />
                  Síntomas
                </p>
                <p className="text-slate-800 bg-white p-3 rounded-xl border border-emerald-100">{verification.paciente.sintomas}</p>
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
    <div className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-sm transition-colors duration-200 ${color}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-3 flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-emerald-600 shrink-0" />}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-semibold">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  )
}

export default DoctorDashboard

function DoctorDashboardSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] animate-pulse">
      <section className="rounded-[2rem] border border-teal-100 bg-white p-6 shadow-xl shadow-teal-950/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full bg-teal-100" />
            <div className="h-10 w-72 rounded-2xl bg-slate-100" />
            <div className="h-4 w-56 rounded-full bg-slate-100" />
          </div>
          <div className="h-11 w-36 rounded-full bg-slate-100" />
        </div>

        <div className="mt-8 grid gap-4 grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-teal-100 bg-teal-50 p-4">
              <div className="h-3 w-24 rounded-full bg-teal-100" />
              <div className="mt-4 h-10 w-16 rounded-xl bg-teal-100" />
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-7 w-44 rounded-xl bg-slate-100" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-5 w-32 rounded-lg bg-slate-100" />
                    <div className="h-3 w-24 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-7 w-20 rounded-full bg-slate-100" />
                </div>
                <div className="mt-4 h-3 w-36 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-teal-100 bg-white p-6 shadow-xl shadow-teal-950/10 sm:p-8">
        <div className="space-y-3">
          <div className="h-3 w-40 rounded-full bg-teal-100" />
          <div className="h-8 w-64 rounded-2xl bg-slate-100" />
          <div className="h-4 w-full rounded-full bg-slate-100" />
          <div className="h-4 w-4/5 rounded-full bg-slate-100" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-slate-100" />
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-slate-100" />
          <div className="mt-6 rounded-3xl border border-teal-100 bg-teal-50 p-4">
            <div className="aspect-[4/3] w-full rounded-[1.5rem] bg-teal-100" />
          </div>
        </div>
      </section>
    </div>
  )
}
