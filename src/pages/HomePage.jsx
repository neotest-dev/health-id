import { Link } from 'react-router-dom'
import { 
  IconCalendar, 
  IconUser, 
  IconDoctor, 
  IconAdmin, 
  IconShield, 
  IconKey 
} from '../components/Icons'

const cards = [
  {
    title: 'Registro de pacientes',
    description: 'El paciente agenda su cita, registra sus datos y deja su descriptor facial para proteger el historial.',
    to: '/registrar',
    cta: 'Registrar cita',
    icon: IconCalendar,
    color: 'text-teal-700 bg-teal-50 border-teal-100'
  },
  {
    title: 'Consulta del paciente',
    description: 'El paciente confirma su identidad con el rostro y revisa el estado actual de su cita.',
    to: '/paciente/ver-cita',
    cta: 'Ver mi cita',
    icon: IconUser,
    color: 'text-sky-700 bg-sky-50 border-sky-100'
  },
  {
    title: 'Portal médico',
    description: 'Cada doctor entra con sus credenciales, actualiza su perfil y desbloquea expedientes solo al validar el rostro del paciente.',
    to: '/doctor/login',
    cta: 'Entrar como doctor',
    icon: IconDoctor,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-100'
  },
  {
    title: 'Panel administrativo',
    description: 'El administrador crea especialidades, da de alta a los doctores y supervisa la operación general del centro.',
    to: '/admin/login',
    cta: 'Abrir admin',
    icon: IconAdmin,
    color: 'text-violet-700 bg-violet-50 border-violet-100'
  },
]

function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative grid overflow-hidden rounded-[2rem] border border-teal-100 bg-white/85 p-6 shadow-2xl shadow-teal-950/10 backdrop-blur-md sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-teal-700">
            <IconShield className="w-4 h-4 shrink-0" />
            <span>RSA + AES + Face ID</span>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Plataforma médica segura para citas, identidad y expedientes cifrados.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              HealthID combina biometría facial y criptografía híbrida para que médicos, pacientes y administradores operen con una experiencia clara, auditable y responsive.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/registrar" 
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors duration-200 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              <IconCalendar className="w-5 h-5 shrink-0" />
              <span>Registrar nueva cita</span>
            </Link>
            <Link 
              to="/doctor/login" 
              className="flex min-h-12 items-center gap-2 rounded-2xl border border-teal-200 bg-white px-6 py-3.5 text-sm font-bold text-teal-800 shadow-sm transition-colors duration-200 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              <IconDoctor className="w-5 h-5 shrink-0" />
              <span>Acceso médico</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 grid gap-4 rounded-[1.75rem] border border-teal-100 bg-teal-950 p-5 text-sm text-teal-50 shadow-2xl shadow-teal-950/20 sm:p-6">
          <div className="pb-2">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-200">Flujo clínico</p>
            <p className="mt-1 text-lg font-bold text-white">Registro, verificación y consulta cifrada</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 transition-colors duration-200 hover:bg-white/15">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-300/15 font-bold text-teal-100">
                1
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-bold text-white">
                  <IconCalendar className="w-4 h-4 text-teal-200" />
                  Registro
                </p>
                <p className="mt-1.5 text-xs leading-5 text-teal-100/75">El sistema genera llaves RSA, crea una llave AES por paciente y almacena el descriptor facial.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 transition-colors duration-200 hover:bg-white/15">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-300/15 font-bold text-teal-100">
                2
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-bold text-white">
                  <IconShield className="w-4 h-4 text-teal-200" />
                  Validación
                </p>
                <p className="mt-1.5 text-xs leading-5 text-teal-100/75">El doctor ve solo citas pendientes y escanea al paciente para validar su identidad en tiempo real.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 transition-colors duration-200 hover:bg-white/15">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-300/15 font-bold text-teal-100">
                3
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-bold text-white">
                  <IconKey className="w-4 h-4 text-teal-200" />
                  Desbloqueo
                </p>
                <p className="mt-1.5 text-xs leading-5 text-teal-100/75">Si el rostro coincide, el backend usa RSA para descifrar la llave AES y revela de forma segura el historial clínico.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article 
              key={card.title} 
              className="group flex flex-col justify-between rounded-[1.75rem] border border-teal-100 bg-white/85 p-6 shadow-lg shadow-teal-950/10 backdrop-blur-sm transition-colors duration-200 hover:border-teal-200 hover:bg-white"
            >
              <div>
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-950 transition-colors group-hover:text-teal-800">{card.title}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{card.description}</p>
              </div>
              <div className="mt-6 pt-2">
                <Link 
                  to={card.to} 
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-teal-100 bg-teal-50 py-2.5 text-xs font-bold uppercase tracking-wider text-teal-700 transition-colors duration-200 hover:border-teal-200 hover:bg-teal-100 focus:outline-none focus:ring-4 focus:ring-teal-100"
                >
                  <span>{card.cta}</span>
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

export default HomePage
