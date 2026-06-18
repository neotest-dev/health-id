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
      <section className="self-start rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8 lg:sticky lg:top-28">
        <div>
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-teal-700">
              <IconUser className="w-5 h-5" />
              <p className="text-xs uppercase tracking-[0.3em] font-bold">Consulta del paciente</p>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Ver mi cita y expediente</h1>
            <p className="text-sm leading-7 text-slate-600">
              El rostro valida al paciente antes de mostrar la cita y descifrar la información clínica.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconShield className="w-4 h-4 text-teal-600" />
                DNI
              </span>
              <input
                value={dni}
                onChange={(event) => setDni(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                placeholder="Ingresa tu DNI"
              />
            </label>

            <button
              type="button"
              onClick={handleCheck}
              disabled={loading}
              className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              <IconSearch className="w-5 h-5 shrink-0" />
              <span>{loading ? 'Validando identidad...' : 'Consultar mi cita'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 space-y-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-inner">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-200 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-bold">Cita activa</p>
                <p className="mt-1 text-xl font-black tracking-wide text-slate-950">{result.cita.codigo}</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
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
            
            <div className="space-y-3 border-t border-emerald-200 pt-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                  <IconAlert className="w-4 h-4 text-emerald-600" />
                  Alergias
                </p>
                <p className="mt-1 rounded-xl border border-emerald-100 bg-white p-3 text-slate-800">{result.paciente.alergias}</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                  <IconInfo className="w-4 h-4 text-emerald-600" />
                  Síntomas registrados
                </p>
                <p className="mt-1 rounded-xl border border-emerald-100 bg-white p-3 text-slate-800">{result.paciente.sintomas}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col justify-between rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-teal-700">
            <IconShield className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Escaneo</p>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Valida tu rostro</h2>
          <p className="text-sm leading-7 text-slate-600">
            Captura tu rostro para autorizar la consulta. La cámara se apaga automáticamente al cerrar la ventana.
          </p>
        </div>
        <div>
          <FacialScanner onDescriptorCaptured={setDescriptor} buttonLabel="Capturar para consultar" />
        </div>
      </section>
    </div>
  )
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3.5 transition-colors hover:border-emerald-200">
      {Icon && <Icon className="w-5 h-5 text-emerald-600 shrink-0" />}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-semibold">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
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
