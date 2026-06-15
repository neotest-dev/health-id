import { useEffect, useState } from 'react'
import FacialScanner from '../components/FacialScanner'
import Spinner from '../components/Spinner'
import { apiRequest } from '../lib/api'
import { 
  IconCalendar, 
  IconUser, 
  IconBlood, 
  IconSpecialty, 
  IconClock,
  IconShield, 
  IconAlert, 
  IconInfo,
  IconCheck
} from '../components/Icons'

const initialForm = {
  dni: '',
  nombre: '',
  edad: '',
  tipoSangre: '',
  alergias: '',
  sintomas: '',
  especialidadId: '',
  disponibilidadId: '',
}

function formatDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString()
}

function RegistrarPaciente() {
  const [form, setForm] = useState(initialForm)
  const [descriptor, setDescriptor] = useState(null)
  const [especialidades, setEspecialidades] = useState([])
  const [disponibilidades, setDisponibilidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDates, setLoadingDates] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadEspecialidades() {
      try {
        const data = await apiRequest('/api/admin/listar-especialidades')
        setEspecialidades(data.especialidades || [])
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadEspecialidades()
  }, [])

  useEffect(() => {
    async function loadDisponibilidades() {
      if (!form.especialidadId) {
        setDisponibilidades([])
        return
      }

      setLoadingDates(true)

      try {
        const data = await apiRequest(`/api/disponibilidades/listar?especialidadId=${encodeURIComponent(form.especialidadId)}`)
        setDisponibilidades(data.disponibilidades || [])
      } catch (requestError) {
        setDisponibilidades([])
        setError(requestError.message)
      } finally {
        setLoadingDates(false)
      }
    }

    loadDisponibilidades()
  }, [form.especialidadId])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'especialidadId' ? { disponibilidadId: '' } : {}),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!descriptor) {
      setError('Debes capturar el rostro del paciente antes de registrar la cita.')
      return
    }

    setSubmitting(true)

    try {
      const data = await apiRequest('/api/registrar-paciente', {
        method: 'POST',
        body: {
          dni: form.dni,
          nombre: form.nombre,
          edad: form.edad,
          tipoSangre: form.tipoSangre,
          alergias: form.alergias,
          sintomas: form.sintomas,
          especialidadId: form.especialidadId,
          disponibilidadId: form.disponibilidadId,
          descriptorFacial: descriptor,
        },
      })

      setMessage(`Cita creada correctamente. Código: ${data.cita.codigo}`)
      setForm(initialForm)
      setDisponibilidades([])
      setDescriptor(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300">
            <IconCalendar className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Registro del paciente</p>
          </div>
          <h1 className="text-3xl font-black text-white">Nueva cita cifrada</h1>
          <p className="text-sm leading-7 text-slate-300">
            Todos los datos clínicos se empaquetan en un JSON y se cifran con AES. La llave AES queda protegida con RSA.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="DNI" name="dni" value={form.dni} onChange={updateField} required icon={IconShield} placeholder="Escribe el DNI" />
            <Field label="Nombre completo" name="nombre" value={form.nombre} onChange={updateField} required icon={IconUser} placeholder="Ej: Juan Pérez" />
            <Field label="Edad" name="edad" type="number" value={form.edad} onChange={updateField} required icon={IconClock} placeholder="Ej: 30" />
            <Field label="Tipo de sangre" name="tipoSangre" value={form.tipoSangre} onChange={updateField} required icon={IconBlood} placeholder="Ej: O+" />
          </div>

          <TextArea label="Alergias" name="alergias" value={form.alergias} onChange={updateField} required icon={IconAlert} placeholder="Menciona alergias o escribe 'Ninguna'" />
          <TextArea label="Síntomas" name="sintomas" value={form.sintomas} onChange={updateField} required icon={IconInfo} placeholder="Describe los síntomas actuales" />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconSpecialty className="w-4 h-4 text-cyan-400" />
                Especialidad
              </span>
              <select
                name="especialidadId"
                value={form.especialidadId}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-0 transition focus:border-cyan-400"
              >
                <option value="">Selecciona una especialidad</option>
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconCalendar className="w-4 h-4 text-cyan-400" />
                Fecha disponible
              </span>
              <select
                name="disponibilidadId"
                value={form.disponibilidadId}
                onChange={updateField}
                required
                disabled={!form.especialidadId || loadingDates}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none ring-0 transition focus:border-cyan-400"
              >
                <option value="">Selecciona una fecha</option>
                {disponibilidades.map((disponibilidad) => (
                  <option key={disponibilidad.id} value={disponibilidad.id}>
                    {formatDate(disponibilidad.fecha)} · {disponibilidad.cuposDisponibles} cupos · {disponibilidad.doctor}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && <Spinner label="Cargando especialidades..." />}
          {loadingDates && <Spinner label="Buscando fechas disponibles..." />}
          {!loadingDates && form.especialidadId && !disponibilidades.length && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <IconCalendar className="mt-0.5 w-5 h-5 shrink-0 text-amber-300" />
              <span>No hay fechas disponibles para esta especialidad. Pide al admin que abra una nueva fecha.</span>
            </div>
          )}
          {descriptor && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Rostro capturado y listo para cifrar la ficha del paciente.</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              <IconCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading || loadingDates}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-cyan-400 px-4 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
          >
            <IconCalendar className="w-5 h-5 shrink-0" />
            <span>{submitting ? 'Registrando...' : 'Registrar paciente y cita'}</span>
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8 flex flex-col justify-between">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <IconShield className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Biometría</p>
          </div>
          <h2 className="text-2xl font-bold text-white">Captura facial del paciente</h2>
          <p className="text-sm leading-7 text-slate-300">
            El descriptor facial se usa para autorizar el descifrado posterior del historial clínico.
          </p>
        </div>
        <div className="flex-grow flex flex-col justify-center">
          <FacialScanner onDescriptorCaptured={setDescriptor} buttonLabel="Escanear rostro" />
        </div>
      </section>
    </div>
  )
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span className="flex items-center gap-1.5 font-semibold">
        {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
        {label}
      </span>
      <input {...props} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600" />
    </label>
  )
}

function TextArea({ label, icon: Icon, ...props }) {
  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span className="flex items-center gap-1.5 font-semibold">
        {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
        {label}
      </span>
      <textarea {...props} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm outline-none transition focus:border-cyan-400 placeholder:text-slate-600" />
    </label>
  )
}

export default RegistrarPaciente
