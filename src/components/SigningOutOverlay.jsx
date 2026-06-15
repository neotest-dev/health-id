import { IconLogout } from './Icons'

function SigningOutOverlay({ message = 'Cerrando sesion segura', detail = 'Estamos limpiando la sesion y protegiendo tu acceso.' }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-xl">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-rose-500/20 bg-slate-900/90 p-8 text-center shadow-[0_30px_80px_rgba(2,6,23,0.6)] sm:p-10">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/60 to-transparent" />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-400/20">
          <span className="absolute h-20 w-20 animate-ping rounded-full border border-rose-400/20" />
          <IconLogout className="h-9 w-9 text-rose-300" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-rose-300">HealthID</p>
        <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{message}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">{detail}</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-300 [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-400 [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-rose-500" />
        </div>
      </div>
    </div>
  )
}

export default SigningOutOverlay
