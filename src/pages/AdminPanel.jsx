import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'
import { 
  IconAdmin, 
  IconDoctor, 
  IconCalendar, 
  IconClock, 
  IconSpecialty, 
  IconAlert, 
  IconCheck
} from '../components/Icons'

function AdminPanel() {
  const { session } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('specialties')
  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [availability, setAvailability] = useState([])
  const [editingSpecialtyId, setEditingSpecialtyId] = useState(null)
  const [editingDoctorId, setEditingDoctorId] = useState(null)
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null)
  const [doctorForm, setDoctorForm] = useState({ dni: '', fullName: '', especialidadId: '' })
  const [specialtyForm, setSpecialtyForm] = useState({ nombre: '', descripcion: '' })
  const [availabilityForm, setAvailabilityForm] = useState({ doctorProfileId: '', fecha: '', cuposTotales: '8' })
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    async function bootstrap() {
      try {
        if (!session?.access_token) {
          return
        }

        await loadProtectedData(session.access_token)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [session])

  async function loadProtectedData(token) {
    const [doctorsData, specialtiesData, appointmentsData, availabilityData] = await Promise.all([
      apiRequest('/api/admin/doctores', { token }),
      apiRequest('/api/admin/especialidades'),
      apiRequest('/api/admin/citas', { token }),
      apiRequest('/api/admin/disponibilidades', { token }),
    ])

    setDoctors(doctorsData.doctores || [])
    setSpecialties(specialtiesData.especialidades || [])
    setAppointments(appointmentsData.citas || [])
    setAvailability(availabilityData.disponibilidades || [])
  }

  function updateState(setter) {
    return (event) => {
      const { name, value } = event.target
      setter((current) => ({ ...current, [name]: value }))
    }
  }

  async function handleCreateSpecialty(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    openConfirmAction({
      title: editingSpecialtyId ? 'Guardar cambios de especialidad' : 'Crear especialidad',
      message: editingSpecialtyId
        ? 'Se actualizarán los datos de esta especialidad en el catálogo médico.'
        : 'Se creará una nueva especialidad disponible para agenda y citas.',
      confirmLabel: editingSpecialtyId ? 'Guardar cambios' : 'Crear especialidad',
      onConfirm: async () => {
        await apiRequest('/api/admin/especialidades', {
          method: editingSpecialtyId ? 'PUT' : 'POST',
          token: session.access_token,
          body: editingSpecialtyId ? { id: editingSpecialtyId, ...specialtyForm } : specialtyForm,
        })
        setSpecialtyForm({ nombre: '', descripcion: '' })
        setEditingSpecialtyId(null)
        setSuccess(editingSpecialtyId ? 'Especialidad actualizada correctamente.' : 'Especialidad creada correctamente.')
        await loadProtectedData(session.access_token)
      },
    })
  }

  async function handleCreateDoctor(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    openConfirmAction({
      title: editingDoctorId ? 'Guardar cambios del médico' : 'Crear médico',
      message: editingDoctorId
        ? 'Se actualizarán los datos profesionales del médico seleccionado.'
        : 'Se creará el acceso técnico del médico con una contraseña temporal.',
      confirmLabel: editingDoctorId ? 'Guardar cambios' : 'Crear médico',
      onConfirm: async () => {
        const data = await apiRequest('/api/admin/doctores', {
          method: editingDoctorId ? 'PUT' : 'POST',
          token: session.access_token,
          body: editingDoctorId ? { id: editingDoctorId, ...doctorForm } : doctorForm,
        })
        setDoctorForm({ dni: '', fullName: '', especialidadId: '' })
        setEditingDoctorId(null)
        setSuccess(editingDoctorId
          ? 'Médico actualizado correctamente.'
          : `Médico creado. Email técnico: ${data.doctor.email}.`)
        await loadProtectedData(session.access_token)
      },
    })
  }

  async function handleCreateAvailability(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    openConfirmAction({
      title: editingAvailabilityId ? 'Guardar cambios de disponibilidad' : 'Crear disponibilidad',
      message: editingAvailabilityId
        ? 'Se actualizará la fecha y la capacidad diaria de esta agenda.'
        : 'Se abrirá una nueva disponibilidad diaria para el médico seleccionado.',
      confirmLabel: editingAvailabilityId ? 'Guardar cambios' : 'Crear disponibilidad',
      onConfirm: async () => {
        await apiRequest('/api/admin/disponibilidades', {
          method: editingAvailabilityId ? 'PUT' : 'POST',
          token: session.access_token,
          body: editingAvailabilityId ? { id: editingAvailabilityId, fecha: availabilityForm.fecha, cuposTotales: availabilityForm.cuposTotales } : availabilityForm,
        })

        setAvailabilityForm({ doctorProfileId: '', fecha: '', cuposTotales: '8' })
        setEditingAvailabilityId(null)
        setSuccess(editingAvailabilityId ? 'Disponibilidad actualizada correctamente.' : 'Disponibilidad creada correctamente.')
        await loadProtectedData(session.access_token)
      },
    })
  }

  function openConfirmAction({ title, message, confirmLabel, tone = 'primary', onConfirm }) {
    setConfirmAction({ title, message, confirmLabel, tone, onConfirm, loading: false })
  }

  async function runConfirmAction() {
    if (!confirmAction) {
      return
    }

    setError('')
    setSuccess('')
    setConfirmAction((current) => ({ ...current, loading: true }))

    try {
      await confirmAction.onConfirm()
      setConfirmAction(null)
    } catch (requestError) {
      setError(requestError.message)
      setConfirmAction(null)
    }
  }

  function startEditSpecialty(specialty) {
    setError('')
    setSuccess('')
    setEditingSpecialtyId(specialty.id)
    setSpecialtyForm({ nombre: specialty.nombre || '', descripcion: specialty.descripcion || '' })
  }

  function resetSpecialtyForm() {
    setEditingSpecialtyId(null)
    setSpecialtyForm({ nombre: '', descripcion: '' })
  }

  function startEditDoctor(doctor) {
    setError('')
    setSuccess('')
    setEditingDoctorId(doctor.id)
    setDoctorForm({
      dni: doctor.dni || '',
      fullName: doctor.full_name || '',
      especialidadId: doctor.especialidad_id || '',
    })
  }

  function resetDoctorForm() {
    setEditingDoctorId(null)
    setDoctorForm({ dni: '', fullName: '', especialidadId: '' })
  }

  function startEditAvailability(item) {
    setError('')
    setSuccess('')
    setEditingAvailabilityId(item.id)
    setAvailabilityForm({
      doctorProfileId: item.doctor_profile_id || '',
      fecha: item.fecha || '',
      cuposTotales: String(item.cupos_totales || ''),
    })
  }

  function resetAvailabilityForm() {
    setEditingAvailabilityId(null)
    setAvailabilityForm({ doctorProfileId: '', fecha: '', cuposTotales: '8' })
  }

  async function toggleAvailability(item) {
    openConfirmAction({
      title: item.activa ? 'Desactivar disponibilidad' : 'Activar disponibilidad',
      message: item.activa
        ? 'La fecha dejará de mostrarse para nuevas reservas, pero no se perderá el historial.'
        : 'La fecha volverá a mostrarse para nuevas reservas si tiene cupos.',
      confirmLabel: item.activa ? 'Desactivar' : 'Activar',
      tone: item.activa ? 'danger' : 'success',
      onConfirm: async () => {
        await apiRequest('/api/admin/disponibilidades', {
          method: 'PATCH',
          token: session.access_token,
          body: { id: item.id, activa: !item.activa },
        })
        setSuccess(item.activa ? 'Disponibilidad desactivada.' : 'Disponibilidad activada.')
        await loadProtectedData(session.access_token)
      },
    })
  }

  async function updateAppointmentStatus(id, estado) {
    openConfirmAction({
      title: 'Actualizar estado de cita',
      message: `La cita quedará marcada como ${estado}.`,
      confirmLabel: 'Confirmar cambio',
      tone: estado === 'cancelada' ? 'danger' : 'primary',
      onConfirm: async () => {
        await apiRequest('/api/admin/citas', {
          method: 'PATCH',
          token: session.access_token,
          body: { id, estado },
        })
        setSuccess('Estado de cita actualizado correctamente.')
        await loadProtectedData(session.access_token)
      },
    })
  }

  const formatDate = (value) => {
    if (!value) {
      return 'Sin fecha'
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString()
  }

  const selectedAvailabilityDoctor = doctors.find((doctor) => doctor.id === availabilityForm.doctorProfileId) || null
  const formCardClass = 'rounded-[1.75rem] border border-teal-100 bg-white p-6 shadow-lg shadow-teal-950/5'
  const labelClass = 'block space-y-2 text-sm text-slate-700'
  const fieldClass = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100'
  const primaryButtonClass = 'min-h-12 cursor-pointer rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100'
  const itemCardClass = 'rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm transition-colors duration-200 hover:border-teal-200 hover:bg-teal-50/40'

  if (loading) {
    return <AdminPanelSkeleton />
  }

  const menuItems = [
    { id: 'specialties', label: 'Crear especialidad', icon: IconSpecialty, hint: 'Base medica' },
    { id: 'doctors', label: 'Alta de medico', icon: IconDoctor, hint: 'Acceso y perfil' },
    { id: 'availability', label: 'Disponibilidad diaria', icon: IconCalendar, hint: 'Agenda y cupos' },
    { id: 'reports', label: 'Reportes', icon: IconClock, hint: 'Operacion general' },
  ]

  function renderSection() {
    if (activeSection === 'specialties') {
      return (
        <div className="space-y-6">
          <SectionIntro
            eyebrow="Catalogo"
            title={editingSpecialtyId ? 'Editar especialidad' : 'Crear especialidad'}
            description="Registra nuevas areas medicas para que luego puedan abrirse disponibilidades y citas reales."
          />
          <form className={formCardClass} onSubmit={handleCreateSpecialty}>
            <div className="grid gap-4">
              <label className={labelClass}>
                <span className="font-semibold">Nombre</span>
                <input name="nombre" value={specialtyForm.nombre} onChange={updateState(setSpecialtyForm)} placeholder="Ej: Pediatria" className={fieldClass} />
              </label>
              <label className={labelClass}>
                <span className="font-semibold">Descripcion</span>
                <textarea name="descripcion" value={specialtyForm.descripcion} onChange={updateState(setSpecialtyForm)} placeholder="Breve descripcion de la especialidad medica" rows="4" className={fieldClass} />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className={`flex-1 ${primaryButtonClass}`}>
                  {editingSpecialtyId ? 'Actualizar especialidad' : 'Guardar especialidad'}
                </button>
                {editingSpecialtyId && (
                  <button type="button" onClick={resetSpecialtyForm} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                    Cancelar edición
                  </button>
                )}
              </div>
            </div>
          </form>
          <PanelList title="Especialidades activas" countLabel={`${specialties.length} registros`}>
            {specialties.length ? specialties.map((specialty) => (
              <article key={specialty.id} className={itemCardClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black tracking-wide text-slate-950">{specialty.nombre}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{specialty.descripcion || 'Sin descripcion.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <ActionButton label="Editar" onClick={() => startEditSpecialty(specialty)} />
                  </div>
                </div>
              </article>
            )) : <EmptyState message="No hay especialidades registradas todavia." />}
          </PanelList>
        </div>
      )
    }

    if (activeSection === 'doctors') {
      return (
        <div className="space-y-6">
          <SectionIntro
            eyebrow="Accesos"
            title={editingDoctorId ? 'Editar medico' : 'Alta de medico'}
            description="Crea cuentas tecnicas para nuevos doctores y asignales su especialidad principal."
          />
          <form className={formCardClass} onSubmit={handleCreateDoctor}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className={labelClass}>
                <span className="font-semibold">DNI</span>
                <input name="dni" value={doctorForm.dni} onChange={updateState(setDoctorForm)} placeholder="DNI del medico" disabled={Boolean(editingDoctorId)} className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-500`} />
              </label>
              <label className={labelClass}>
                <span className="font-semibold">Nombre completo</span>
                <input name="fullName" value={doctorForm.fullName} onChange={updateState(setDoctorForm)} placeholder="Nombre del medico" className={fieldClass} />
              </label>
              <label className={labelClass}>
                <span className="font-semibold">Especialidad</span>
                <select name="especialidadId" value={doctorForm.especialidadId} onChange={updateState(setDoctorForm)} className={fieldClass}>
                  <option value="">Selecciona una especialidad</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>{specialty.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs leading-6 text-teal-800">
              La especialidad base se define aquí, pero la agenda diaria se abre en la sección de <span className="font-bold text-teal-700">Disponibilidad diaria</span>.
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="submit" className={`w-full flex-1 ${primaryButtonClass}`}>
                {editingDoctorId ? 'Actualizar medico' : 'Crear medico'}
              </button>
              {editingDoctorId && (
                <button type="button" onClick={resetDoctorForm} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
          <PanelList title="Medicos registrados" countLabel={`${doctors.length} medicos`}>
            {doctors.length ? doctors.map((doctor) => (
              <article key={doctor.id} className={itemCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black tracking-wide text-slate-950">{doctor.full_name || 'Perfil pendiente'}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">DNI {doctor.dni}</p>
                  </div>
                  <ActionButton label="Editar" onClick={() => startEditDoctor(doctor)} />
                </div>
                <p className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <IconSpecialty className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  {doctor.especialidad || 'Sin especialidad'}
                </p>
              </article>
            )) : <EmptyState message="No hay medicos registrados todavia." />}
          </PanelList>
        </div>
      )
    }

    if (activeSection === 'availability') {
      return (
        <div className="space-y-6">
          <SectionIntro
            eyebrow="Agenda"
            title={editingAvailabilityId ? 'Editar disponibilidad' : 'Abrir disponibilidad diaria'}
            description="Define que doctor atendera en una fecha concreta. La especialidad se toma automaticamente del perfil real del medico."
          />
          <form className={formCardClass} onSubmit={handleCreateAvailability}>
            <div className="grid gap-4">
              <label className={labelClass}>
                <span className="font-semibold">Doctor</span>
                <select name="doctorProfileId" value={availabilityForm.doctorProfileId} onChange={updateState(setAvailabilityForm)} disabled={Boolean(editingAvailabilityId)} className={`${fieldClass} disabled:bg-slate-100 disabled:text-slate-500`}>
                  <option value="">Selecciona un doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.full_name || doctor.dni}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3.5 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Especialidad asignada</p>
                <p className="mt-2 text-sm font-semibold text-teal-700">
                  {selectedAvailabilityDoctor?.especialidad || 'Selecciona un doctor para usar su especialidad registrada.'}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>
                  <span className="font-semibold">Fecha</span>
                  <input name="fecha" type="date" value={availabilityForm.fecha} onChange={updateState(setAvailabilityForm)} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  <span className="font-semibold">Cupos diarios</span>
                  <input name="cuposTotales" type="number" min="1" value={availabilityForm.cuposTotales} onChange={updateState(setAvailabilityForm)} className={fieldClass} />
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" className={`flex-1 ${primaryButtonClass}`}>
                  {editingAvailabilityId ? 'Actualizar disponibilidad' : 'Guardar disponibilidad'}
                </button>
                {editingAvailabilityId && (
                  <button type="button" onClick={resetAvailabilityForm} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                    Cancelar edición
                  </button>
                )}
              </div>
            </div>
          </form>
          <PanelList title="Fechas abiertas" countLabel={`${availability.length} disponibilidades`}>
            {availability.length ? availability.map((item) => (
              <article key={item.id} className={itemCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black tracking-wide text-slate-950">{item.especialidad}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.doctor}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      {formatDate(item.fecha)}
                    </span>
                    <div className="flex gap-2">
                      <ActionButton label="Editar" onClick={() => startEditAvailability(item)} />
                      <ActionButton label={item.activa ? 'Desactivar' : 'Activar'} tone={item.activa ? 'danger' : 'neutral'} onClick={() => toggleAvailability(item)} />
                    </div>
                  </div>
                </div>
                <p className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <IconCalendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  {item.cupos_disponibles} de {item.cupos_totales} cupos disponibles · {item.activa ? 'Activa' : 'Inactiva'}
                </p>
              </article>
            )) : <EmptyState message="No hay disponibilidades abiertas todavia." />}
          </PanelList>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <SectionIntro
          eyebrow="Reportes"
          title="Operacion general"
          description="Monitorea el estado de las citas, la carga diaria y el inventario de agenda disponible del centro."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Especialidades" value={String(specialties.length)} accent="cyan" />
          <MetricCard label="Medicos" value={String(doctors.length)} accent="indigo" />
          <MetricCard label="Disponibilidades" value={String(availability.length)} accent="emerald" />
          <MetricCard label="Citas" value={String(appointments.length)} accent="amber" />
        </div>
        <PanelList title="Citas registradas" countLabel={`${appointments.length} citas`}>
          {appointments.length ? appointments.map((appointment) => (
            <article key={appointment.id} className={itemCardClass}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <div>
                  <p className="font-black tracking-wide text-slate-950">{appointment.codigo}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Paciente ref {appointment.paciente_ref}</p>
                </div>
                <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-0.5 text-xs font-bold uppercase text-teal-700">
                  {appointment.estado}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AppointmentDetail label="Especialidad" value={appointment.especialidad} icon={IconSpecialty} />
                <AppointmentDetail label="Fecha cita" value={formatDate(appointment.fecha_cita)} icon={IconCalendar} />
                <AppointmentDetail label="Doctor" value={appointment.doctor || 'Pendiente'} icon={IconDoctor} />
                <AppointmentDetail label="Registro" value={new Date(appointment.created_at).toLocaleString()} icon={IconClock} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton label="Programada" onClick={() => updateAppointmentStatus(appointment.id, 'programada')} />
                <ActionButton label="Atendida" tone="success" onClick={() => updateAppointmentStatus(appointment.id, 'atendida')} />
                <ActionButton label="Cancelada" tone="danger" onClick={() => updateAppointmentStatus(appointment.id, 'cancelada')} />
              </div>
            </article>
          )) : <EmptyState message="No hay citas registradas todavia." />}
        </PanelList>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-2xl shadow-teal-950/10 xl:sticky xl:top-28 xl:h-fit">
          <div className="bg-teal-950 p-5 text-white">
            <div className="flex items-center gap-2 text-teal-200">
              <IconAdmin className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-[0.3em]">Administracion</p>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-white">Centro de mando</h1>
            <p className="mt-2 text-sm leading-6 text-teal-100/80">
              Organiza especialidades, medicos, fechas disponibles y reportes desde un solo lugar.
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                   onClick={() => {
                     setError('')
                     setSuccess('')
                     setConfirmAction(null)
                     resetSpecialtyForm()
                     resetDoctorForm()
                     resetAvailabilityForm()
                     setActiveSection(item.id)
                   }}
                  className={`cursor-pointer rounded-2xl border px-4 py-4 text-left transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-teal-100 ${isActive ? 'border-teal-200 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/70'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 ${isActive ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-teal-950' : 'text-slate-800'}`}>{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.hint}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-teal-100 bg-white/95 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur-sm sm:p-8">
          <div className="grid gap-4 border-b border-teal-100 pb-6 sm:grid-cols-3">
            <MetricCard label="Especialidades" value={String(specialties.length)} accent="cyan" />
            <MetricCard label="Medicos" value={String(doctors.length)} accent="indigo" />
            <MetricCard label="Citas" value={String(appointments.length)} accent="emerald" />
          </div>

          <div className="mt-8">{renderSection()}</div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <IconAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <FeedbackModal tone="success" title="Acción completada" message={success} onClose={() => setSuccess('')} />
          )}

          {confirmAction && (
            <ConfirmModal
              title={confirmAction.title}
              message={confirmAction.message}
              confirmLabel={confirmAction.confirmLabel}
              tone={confirmAction.tone}
              loading={confirmAction.loading}
              onClose={() => setConfirmAction(null)}
              onConfirm={runConfirmAction}
            />
          )}
        </section>
      </div>
    </>
  )
}

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-700">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function PanelList({ title, countLabel, children }) {
  return (
    <section className="rounded-[1.75rem] border border-teal-100 bg-teal-50/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-teal-100 pb-4">
        <h3 className="text-xl font-black text-slate-950">{title}</h3>
        <span className="rounded-full border border-teal-100 bg-white px-3 py-1 text-xs font-bold text-teal-700">{countLabel}</span>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  )
}

function EmptyState({ message }) {
  return (
    <p className="rounded-2xl border border-dashed border-teal-200 bg-white px-4 py-6 text-center text-sm font-semibold text-teal-700">
      {message}
    </p>
  )
}

function MetricCard({ label, value, accent }) {
  const accents = {
    cyan: 'border-teal-100 bg-teal-50 text-teal-700',
    indigo: 'border-sky-100 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-100 bg-amber-50 text-amber-700',
  }

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${accents[accent] || accents.cyan}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function AppointmentDetail({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 flex items-center gap-2.5">
      {Icon && <Icon className="w-4 h-4 text-teal-600 shrink-0" />}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-slate-900 font-semibold">{value}</p>
      </div>
    </div>
  )
}

function ActionButton({ label, onClick, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    danger: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${tones[tone] || tones.neutral}`}
    >
      {label}
    </button>
  )
}

function ConfirmModal({ title, message, confirmLabel, tone = 'primary', loading, onClose, onConfirm }) {
  const tones = {
    primary: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-100',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100',
    danger: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-100',
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-teal-950/35 px-4 backdrop-blur-md">
      <div className="animate-modal-in w-full max-w-md overflow-hidden rounded-[1.75rem] border border-teal-100 bg-white p-6 shadow-2xl shadow-teal-950/15">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-700">Confirmación</p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onClose} className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50">
            Cancelar
          </button>
          <button type="button" disabled={loading} onClick={onConfirm} className={`min-h-12 flex-1 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-colors duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-300 ${tones[tone] || tones.primary}`}>
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function FeedbackModal({ title, message, onClose, tone = 'success' }) {
  const themes = {
    success: {
      border: 'border-emerald-200',
      badge: 'text-emerald-700',
      icon: 'text-emerald-600',
      button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100',
    },
  }

  const theme = themes[tone] || themes.success

  return (
    <div className="fixed inset-0 z-[121] flex items-center justify-center bg-teal-950/30 px-4 backdrop-blur-md">
      <div className={`animate-modal-in w-full max-w-md overflow-hidden rounded-[1.75rem] border bg-white p-6 shadow-2xl shadow-teal-950/15 ${theme.border}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
            <IconCheck className={`h-5 w-5 ${theme.icon}`} />
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.28em] ${theme.badge}`}>Listo</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className={`mt-6 min-h-12 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition-colors duration-200 focus:outline-none focus:ring-4 ${theme.button}`}>
          Entendido
        </button>
      </div>
    </div>
  )
}

export default AdminPanel

function AdminPanelSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <section className="rounded-[2rem] border border-teal-100 bg-white p-6 shadow-xl shadow-teal-950/10 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-36 rounded-full bg-teal-100" />
            <div className="h-10 w-72 rounded-2xl bg-slate-100" />
            <div className="h-4 w-80 rounded-full bg-slate-100" />
          </div>
          <div className="h-11 w-36 rounded-full bg-slate-100" />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <section key={cardIndex} className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
                <div className="space-y-3">
                  <div className="h-7 w-48 rounded-xl bg-teal-100" />
                  <div className="h-4 w-64 rounded-full bg-teal-100" />
                </div>
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="space-y-2">
                      <div className="h-4 w-28 rounded-full bg-teal-100" />
                      <div className="h-12 w-full rounded-2xl bg-white" />
                    </div>
                  ))}
                  <div className="h-12 w-full rounded-2xl bg-teal-100" />
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, cardIndex) => (
              <section key={cardIndex} className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
                <div className="space-y-3">
                  <div className="h-7 w-48 rounded-xl bg-teal-100" />
                  <div className="h-4 w-64 rounded-full bg-teal-100" />
                </div>
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="h-5 w-36 rounded-lg bg-slate-100" />
                      <div className="mt-3 h-3 w-28 rounded-full bg-slate-100" />
                      <div className="mt-4 h-4 w-44 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
