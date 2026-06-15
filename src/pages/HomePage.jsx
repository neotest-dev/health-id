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
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    title: 'Consulta del paciente',
    description: 'El paciente confirma su identidad con el rostro y revisa el estado actual de su cita.',
    to: '/paciente/ver-cita',
    cta: 'Ver mi cita',
    icon: IconUser,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  },
  {
    title: 'Portal médico',
    description: 'Cada doctor entra con sus credenciales, actualiza su perfil y desbloquea expedientes solo al validar el rostro del paciente.',
    to: '/doctor/login',
    cta: 'Entrar como doctor',
    icon: IconDoctor,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'Panel administrativo',
    description: 'El administrador crea especialidades, da de alta a los doctores y supervisa la operación general del centro.',
    to: '/admin/login',
    cta: 'Abrir admin',
    icon: IconAdmin,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
]

function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-[2rem] border border-slate-800 bg-slate-900/40 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-12 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 -w-64 -h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-6 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            <IconShield className="w-4 h-4 shrink-0 animate-pulse" />
            <span>RSA + AES + Face ID</span>
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
              HealthID protege historiales clínicos con criptografía híbrida y reconocimiento facial.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              El rostro del paciente autoriza el uso de la llave privada RSA. Los datos clínicos viven cifrados con AES-256-GCM y solo se muestran cuando la identidad coincide.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/registrar" 
              className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 hover:scale-[1.02] duration-200 shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20"
            >
              <IconCalendar className="w-5 h-5 shrink-0" />
              <span>Registrar nueva cita</span>
            </Link>
            <Link 
              to="/doctor/login" 
              className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/40 px-6 py-3.5 text-sm font-bold text-white transition hover:border-slate-500 hover:bg-slate-800 hover:scale-[1.02] duration-200"
            >
              <IconDoctor className="w-5 h-5 shrink-0" />
              <span>Acceso médico</span>
            </Link>
          </div>
        </div>

        {/* Base Flow Cards */}
        <div className="grid gap-4 rounded-[1.75rem] border border-slate-800/80 bg-slate-950/70 p-6 text-sm text-slate-300 shadow-inner">
          <div className="pb-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold">Flujo base</p>
            <p className="mt-1 text-lg font-bold text-white">Registro, verificación y consulta cifrada</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                1
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <IconCalendar className="w-4 h-4 text-cyan-400" />
                  Registro
                </p>
                <p className="mt-1.5 text-xs text-slate-400 leading-5">El sistema genera llaves RSA, crea una llave AES por paciente y almacena el descriptor facial.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                2
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <IconShield className="w-4 h-4 text-cyan-400" />
                  Validación
                </p>
                <p className="mt-1.5 text-xs text-slate-400 leading-5">El doctor ve solo citas pendientes y escanea al paciente para validar su identidad en tiempo real.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                3
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <IconKey className="w-4 h-4 text-cyan-400" />
                  Desbloqueo
                </p>
                <p className="mt-1.5 text-xs text-slate-400 leading-5">Si el rostro coincide, el backend usa RSA para descifrar la llave AES y revela de forma segura el historial clínico.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Action Cards */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article 
              key={card.title} 
              className="group flex flex-col justify-between rounded-[1.75rem] border border-slate-800/80 bg-slate-900/40 p-6 shadow-lg shadow-slate-950/20 hover:border-slate-700 transition-all duration-300"
            >
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.color} mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400 font-medium">{card.description}</p>
              </div>
              <div className="mt-6 pt-2">
                <Link 
                  to={card.to} 
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300 transition hover:border-cyan-400/40"
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
