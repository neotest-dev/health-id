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
        const data = await apiRequest('/api/admin/especialidades')
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
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <section className="rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-teal-700">
            <IconCalendar className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Registro del paciente</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Nueva cita cifrada</h1>
          <p className="text-sm leading-7 text-slate-600">
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
            <label className="space-y-2 text-sm text-slate-700">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconSpecialty className="w-4 h-4 text-teal-600" />
                Especialidad
              </span>
              <select
                name="especialidadId"
                value={form.especialidadId}
                onChange={updateField}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Selecciona una especialidad</option>
                {especialidades.map((especialidad) => (
                  <option key={especialidad.id} value={especialidad.id}>{especialidad.nombre}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="flex items-center gap-1.5 font-semibold">
                <IconCalendar className="w-4 h-4 text-teal-600" />
                Fecha disponible
              </span>
              <select
                name="disponibilidadId"
                value={form.disponibilidadId}
                onChange={updateField}
                required
                disabled={!form.especialidadId || loadingDates}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
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
             <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
               <IconCalendar className="mt-0.5 w-5 h-5 shrink-0 text-amber-600" />
              <span>No hay fechas disponibles para esta especialidad. Pide al admin que abra una nueva fecha.</span>
            </div>
          )}
          {descriptor && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <IconCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Rostro capturado y listo para cifrar la ficha del paciente.</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
              <IconCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading || loadingDates}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
          >
            <IconCalendar className="w-5 h-5 shrink-0" />
            <span>{submitting ? 'Registrando...' : 'Registrar paciente y cita'}</span>
          </button>
        </form>
      </section>

      <section className="self-start rounded-[2rem] border border-teal-100 bg-white/90 p-6 shadow-xl shadow-teal-950/10 backdrop-blur-sm sm:p-8 lg:sticky lg:top-28">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-teal-700">
            <IconShield className="w-5 h-5" />
            <p className="text-xs uppercase tracking-[0.3em] font-bold">Biometría</p>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Captura facial bajo demanda</h2>
          <p className="text-sm leading-7 text-slate-600">
            Registra la identidad facial como último paso. La cámara se abre solo con autorización y se apaga al cerrar el modal.
          </p>
        </div>
        <div>
          <FacialScanner onDescriptorCaptured={setDescriptor} buttonLabel="Registrar rostro del paciente" />
        </div>
      </section>
    </div>
  )
}

function Field({ label, icon: Icon, ...props }) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="flex items-center gap-1.5 font-semibold">
        {Icon && <Icon className="w-4 h-4 text-teal-600" />}
        {label}
      </span>
      <input {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
    </label>
  )
}

function TextArea({ label, icon: Icon, ...props }) {
  return (
    <label className="space-y-2 text-sm text-slate-700">
      <span className="flex items-center gap-1.5 font-semibold">
        {Icon && <Icon className="w-4 h-4 text-teal-600" />}
        {label}
      </span>
      <textarea {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
    </label>
  )
}

export default RegistrarPaciente
