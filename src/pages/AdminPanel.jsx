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
  const [doctorForm, setDoctorForm] = useState({ dni: '', fullName: '', especialidadId: '', turno: 'manana' })
  const [specialtyForm, setSpecialtyForm] = useState({ nombre: '', descripcion: '' })
  const [availabilityForm, setAvailabilityForm] = useState({ doctorProfileId: '', fecha: '', cuposTotales: '8' })

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

    try {
      await apiRequest('/api/admin/especialidades', {
        method: 'POST',
        token: session.access_token,
        body: specialtyForm,
      })
      setSpecialtyForm({ nombre: '', descripcion: '' })
      setSuccess('Especialidad creada correctamente.')
      await loadProtectedData(session.access_token)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleCreateDoctor(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const data = await apiRequest('/api/admin/doctores', {
        method: 'POST',
        token: session.access_token,
        body: doctorForm,
      })
      setDoctorForm({ dni: '', fullName: '', especialidadId: '', turno: 'manana' })
      setSuccess(`Médico creado. Email técnico: ${data.doctor.email}. Contraseña temporal: DNI.`)
      await loadProtectedData(session.access_token)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleCreateAvailability(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      await apiRequest('/api/admin/disponibilidades', {
        method: 'POST',
        token: session.access_token,
        body: availabilityForm,
      })

      setAvailabilityForm({ doctorProfileId: '', fecha: '', cuposTotales: '8' })
      setSuccess('Disponibilidad creada correctamente.')
      await loadProtectedData(session.access_token)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const formatTurno = (turno) => {
    if (turno === 'manana') return 'Mañana'
    if (turno === 'tarde') return 'Tarde'
    return turno
  }

  const formatDate = (value) => {
    if (!value) {
      return 'Sin fecha'
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString()
  }

  const selectedAvailabilityDoctor = doctors.find((doctor) => doctor.id === availabilityForm.doctorProfileId) || null

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
            title="Crear especialidad"
            description="Registra nuevas areas medicas para que luego puedan abrirse disponibilidades y citas reales."
          />
          <form className="rounded-[1.75rem] border border-slate-800 bg-slate-950/60 p-6 shadow-sm" onSubmit={handleCreateSpecialty}>
            <div className="grid gap-4">
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">Nombre</span>
                <input name="nombre" value={specialtyForm.nombre} onChange={updateState(setSpecialtyForm)} placeholder="Ej: Pediatria" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">Descripcion</span>
                <textarea name="descripcion" value={specialtyForm.descripcion} onChange={updateState(setSpecialtyForm)} placeholder="Breve descripcion de la especialidad medica" rows="4" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
              </label>
              <button type="submit" className="rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                Guardar especialidad
              </button>
            </div>
          </form>
          <PanelList title="Especialidades activas" countLabel={`${specialties.length} registros`}>
            {specialties.length ? specialties.map((specialty) => (
              <article key={specialty.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                <p className="font-bold text-white tracking-wide">{specialty.nombre}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{specialty.descripcion || 'Sin descripcion.'}</p>
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
            title="Alta de medico"
            description="Crea cuentas tecnicas para nuevos doctores y asignales su especialidad principal y turno base."
          />
          <form className="rounded-[1.75rem] border border-slate-800 bg-slate-950/60 p-6 shadow-sm" onSubmit={handleCreateDoctor}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">DNI</span>
                <input name="dni" value={doctorForm.dni} onChange={updateState(setDoctorForm)} placeholder="DNI del medico" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">Nombre completo</span>
                <input name="fullName" value={doctorForm.fullName} onChange={updateState(setDoctorForm)} placeholder="Nombre del medico" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
              </label>
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">Especialidad</span>
                <select name="especialidadId" value={doctorForm.especialidadId} onChange={updateState(setDoctorForm)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400">
                  <option value="">Selecciona una especialidad</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>{specialty.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs leading-6 text-slate-300">
              El horario del medico ya no se define aqui. La agenda real se abre despues desde <span className="font-semibold text-cyan-300">Disponibilidad diaria</span>.
            </div>
            <button type="submit" className="mt-4 w-full rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
              Crear medico
            </button>
          </form>
          <PanelList title="Medicos registrados" countLabel={`${doctors.length} medicos`}>
            {doctors.length ? doctors.map((doctor) => (
              <article key={doctor.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white tracking-wide">{doctor.full_name || 'Perfil pendiente'}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">DNI {doctor.dni}</p>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {formatTurno(doctor.turno) || 'Pendiente'}
                  </span>
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
            title="Abrir disponibilidad diaria"
            description="Define que doctor atendera en una fecha concreta. La especialidad se toma automaticamente del perfil real del medico."
          />
          <form className="rounded-[1.75rem] border border-slate-800 bg-slate-950/60 p-6 shadow-sm" onSubmit={handleCreateAvailability}>
            <div className="grid gap-4">
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold">Doctor</span>
                <select name="doctorProfileId" value={availabilityForm.doctorProfileId} onChange={updateState(setAvailabilityForm)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400">
                  <option value="">Selecciona un doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>{doctor.full_name || doctor.dni}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-sm text-slate-300">
                <p className="font-semibold text-slate-200">Especialidad asignada</p>
                <p className="mt-2 text-sm text-cyan-300">
                  {selectedAvailabilityDoctor?.especialidad || 'Selecciona un doctor para usar su especialidad registrada.'}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-200">
                  <span className="font-semibold">Fecha</span>
                  <input name="fecha" type="date" value={availabilityForm.fecha} onChange={updateState(setAvailabilityForm)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
                </label>
                <label className="block space-y-2 text-sm text-slate-200">
                  <span className="font-semibold">Cupos diarios</span>
                  <input name="cuposTotales" type="number" min="1" value={availabilityForm.cuposTotales} onChange={updateState(setAvailabilityForm)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-medium outline-none transition focus:border-cyan-400" />
                </label>
              </div>
              <button type="submit" className="rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                Guardar disponibilidad
              </button>
            </div>
          </form>
          <PanelList title="Fechas abiertas" countLabel={`${availability.length} disponibilidades`}>
            {availability.length ? availability.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white tracking-wide">{item.especialidad}</p>
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.doctor}</p>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {formatDate(item.fecha)}
                  </span>
                </div>
                <p className="mt-3.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <IconCalendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  {item.cupos_disponibles} de {item.cupos_totales} cupos disponibles
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
            <article key={appointment.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/40 pb-2 mb-3">
                <div>
                  <p className="font-bold text-white tracking-wide">{appointment.codigo}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Paciente ref {appointment.paciente_ref}</p>
                </div>
                <span className="rounded-full bg-slate-950/40 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400 uppercase font-semibold">
                  {appointment.estado}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AppointmentDetail label="Especialidad" value={appointment.especialidad} icon={IconSpecialty} />
                <AppointmentDetail label="Fecha cita" value={formatDate(appointment.fecha_cita)} icon={IconCalendar} />
                <AppointmentDetail label="Doctor" value={appointment.doctor || 'Pendiente'} icon={IconDoctor} />
                <AppointmentDetail label="Registro" value={new Date(appointment.created_at).toLocaleString()} icon={IconClock} />
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
        <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-5 shadow-xl xl:sticky xl:top-28 xl:h-fit">
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <IconAdmin className="h-5 w-5 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-[0.3em]">Administracion</p>
            </div>
            <h1 className="mt-3 text-2xl font-black text-white">Centro de mando</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Organiza especialidades, medicos, fechas disponibles y reportes desde un solo lugar.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
                    setActiveSection(item.id)
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${isActive ? 'border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/70'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2 ${isActive ? 'bg-cyan-400/15 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>{item.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.hint}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 shadow-xl sm:p-8">
          <div className="grid gap-4 border-b border-slate-800 pb-6 sm:grid-cols-3">
            <MetricCard label="Especialidades" value={String(specialties.length)} accent="cyan" />
            <MetricCard label="Medicos" value={String(doctors.length)} accent="indigo" />
            <MetricCard label="Citas" value={String(appointments.length)} accent="emerald" />
          </div>

          <div className="mt-8">{renderSection()}</div>

          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <IconAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <IconCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p>
      <h2 className="text-3xl font-black text-white">{title}</h2>
      <p className="max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
    </div>
  )
}

function PanelList({ title, countLabel, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-950/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">{countLabel}</span>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  )
}

function EmptyState({ message }) {
  return (
    <p className="rounded-2xl border border-slate-850 bg-slate-900/20 px-4 py-6 text-center text-sm font-medium text-slate-400">
      {message}
    </p>
  )
}

function MetricCard({ label, value, accent }) {
  const accents = {
    cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  }

  return (
    <div className={`rounded-3xl border p-4 ${accents[accent] || accents.cyan}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em]">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  )
}

function AppointmentDetail({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-850 bg-slate-950/50 p-2.5 flex items-center gap-2.5">
      {Icon && <Icon className="w-4 h-4 text-cyan-400/80 shrink-0" />}
      <div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-white font-semibold">{value}</p>
      </div>
    </div>
  )
}

export default AdminPanel

function AdminPanelSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/55 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-36 rounded-full bg-cyan-400/15" />
            <div className="h-10 w-72 rounded-2xl bg-slate-800" />
            <div className="h-4 w-80 rounded-full bg-slate-800" />
          </div>
          <div className="h-11 w-36 rounded-full bg-slate-800" />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <section key={cardIndex} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/60 p-5">
                <div className="space-y-3">
                  <div className="h-7 w-48 rounded-xl bg-slate-800" />
                  <div className="h-4 w-64 rounded-full bg-slate-800" />
                </div>
                <div className="mt-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="space-y-2">
                      <div className="h-4 w-28 rounded-full bg-slate-800" />
                      <div className="h-12 w-full rounded-2xl bg-slate-800" />
                    </div>
                  ))}
                  <div className="h-12 w-full rounded-2xl bg-slate-800" />
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, cardIndex) => (
              <section key={cardIndex} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/60 p-5">
                <div className="space-y-3">
                  <div className="h-7 w-48 rounded-xl bg-slate-800" />
                  <div className="h-4 w-64 rounded-full bg-slate-800" />
                </div>
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, rowIndex) => (
                    <div key={rowIndex} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="h-5 w-36 rounded-lg bg-slate-800" />
                      <div className="mt-3 h-3 w-28 rounded-full bg-slate-800" />
                      <div className="mt-4 h-4 w-44 rounded-full bg-slate-800" />
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
