import { useState } from 'react'
import FacialScanner from '../components/FacialScanner'
import { apiRequest } from '../lib/api'
import { 
  IconUser, 
  IconShield, 
  IconBlood, 
  IconSpecialty, 
  IconClock, 
  IconAlert, 
  IconInfo
} from '../components/Icons'

function PacienteVerCita() {
  const [dni, setDni] = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleCheck() {
    setError('')
    setResult(null)

    if (!dni || !descriptor) {
      setError('Ingresa el DNI y captura tu rostro antes de consultar la cita.')
      return
    }

    setLoading(true)

    try {
      const data = await apiRequest('/api/paciente/ver-mi-cita', {
        method: 'POST',
        body: { dni, descriptorFacial: descriptor },
      })
      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (value) => {
    if (!value) {
      return 'Pendiente de programacion'
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-cyan-300">
              <IconUser className="w-5 h-5" />
              <p className="text-xs uppercase tracking-[0.3em] font-bold">Consulta del paciente</p>
            </div>
            <h1 className="text-3xl font-black text-white">Ver mi cita y expediente</h1>
            <p className="text-sm leading-7 text-slate-300">
              El rostro valida al paciente antes de mostrar la cita y descifrar la información clínica.
            </p>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-slate-200 block">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconShield className="w-4 h-4 text-cyan-400" />
                DNI
              </span>
              <input
                value={dni}
                onChange={(event) => setDni(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600 font-medium"
                placeholder="Ingresa tu DNI"
              />
            </label>

            <button
              type="button"
              onClick={handleCheck}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
            >
              <IconSearch className="w-5 h-5 shrink-0" />
              <span>{loading ? 'Validando identidad...' : 'Consultar mi cita'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 space-y-4 rounded-[1.5rem] border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 shadow-inner">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold">Cita activa</p>
                <p className="mt-1 text-xl font-bold text-white tracking-wide">{result.cita.codigo}</p>
              </div>
              <span className="rounded-full bg-emerald-400/25 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                {result.cita.estado}
              </span>
            </div>
            
            <dl className="grid gap-3 md:grid-cols-2">
              <Info label="Nombre" value={result.paciente.nombre} icon={IconUser} />
              <Info label="Edad" value={`${result.paciente.edad} años`} icon={IconClock} />
              <Info label="Tipo de sangre" value={result.paciente.tipoSangre} icon={IconBlood} />
              <Info label="Fecha" value={formatDate(result.cita.fecha_cita)} icon={IconClock} />
              <Info label="Especialidad" value={result.cita.especialidad} icon={IconSpecialty} />
              <Info label="Doctor" value={result.cita.doctor || 'Pendiente'} icon={IconUser} />
              <Info label="Estado" value={result.cita.estado} icon={IconShield} />
            </dl>
            
            <div className="border-t border-emerald-500/15 pt-3 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold flex items-center gap-1.5">
                  <IconAlert className="w-4 h-4 text-emerald-400" />
                  Alergias
                </p>
                <p className="mt-1 text-white bg-slate-950/20 p-3 rounded-xl border border-emerald-400/10">{result.paciente.alergias}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 font-bold flex items-center gap-1.5">
                  <IconInfo className="w-4 h-4 text-emerald-400" />
                  Síntomas registrados
                </p>
                <p className="mt-1 text-white bg-slate-950/20 p-3 rounded-xl border border-emerald-400/10">{result.paciente.sintomas}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8 flex flex-col justify-between">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <IconShield className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Escaneo</p>
          </div>
          <h2 className="text-2xl font-bold text-white">Valida tu rostro</h2>
          <p className="text-sm leading-7 text-slate-300">
            El escáner verificará tus rasgos faciales para autorizar el acceso a tus datos.
          </p>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <FacialScanner onDescriptorCaptured={setDescriptor} buttonLabel="Capturar para consultar" />
        </div>
      </section>
    </div>
  )
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-slate-950/30 p-3.5 flex items-center gap-3 hover:border-emerald-500/25 transition-colors">
      {Icon && <Icon className="w-5 h-5 text-emerald-400 shrink-0" />}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

function IconSearch({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default PacienteVerCita
