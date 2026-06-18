function Spinner({
  label = 'Un momento...',
  description,
  centered = false,
  compact = false,
}) {
  if (centered) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-teal-100 bg-white/92 p-8 text-center shadow-2xl shadow-teal-950/12 backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-100">
            <span className="absolute h-24 w-24 animate-ping rounded-full border border-teal-200" />
            <span className="absolute h-16 w-16 rounded-full bg-teal-100/70" />
            <span className="relative h-11 w-11 animate-spin rounded-full border-[4px] border-teal-600 border-t-transparent shadow-[0_0_24px_rgba(13,148,136,0.18)]" />
          </div>
          <p className="relative mt-6 text-xs font-black uppercase tracking-[0.35em] text-teal-700">HealthID</p>
          <h2 className="relative mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{label}</h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-600">
            {description || 'Estamos preparando una experiencia segura para continuar.'}
          </p>
          <div className="relative mt-6 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-400 [animation-delay:-0.2s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.1s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 text-slate-600 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} animate-spin rounded-full border-2 border-teal-600 border-t-transparent`} />
      <span>{label}</span>
    </div>
  )
}

export default Spinner
