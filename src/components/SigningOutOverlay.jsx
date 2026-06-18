import { IconLogout } from './Icons'

function SigningOutOverlay({ message = 'Cerrando sesion segura', detail = 'Estamos limpiando la sesion y protegiendo tu acceso.' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-teal-950/35 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-teal-100 bg-white/94 p-8 text-center shadow-2xl shadow-teal-950/20 sm:p-10">
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-rose-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-8 h-48 w-48 rounded-full bg-teal-100/80 blur-3xl" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-100">
          <span className="absolute h-24 w-24 animate-ping rounded-full border border-rose-200" />
          <IconLogout className="relative h-9 w-9 text-rose-600" />
        </div>
        <p className="relative mt-6 text-xs font-black uppercase tracking-[0.35em] text-teal-700">HealthID</p>
        <h2 className="relative mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{message}</h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-600">{detail}</p>
        <div className="relative mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-600" />
        </div>
      </div>
    </div>
  )
}

export default SigningOutOverlay
