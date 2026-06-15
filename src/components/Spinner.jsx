function Spinner({
  label = 'Un momento...',
  description,
  centered = false,
  compact = false,
}) {
  if (centered) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/70 p-8 text-center shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <span className="absolute h-20 w-20 animate-ping rounded-full border border-cyan-400/20" />
            <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-cyan-400/80 border-t-transparent shadow-[0_0_24px_rgba(34,211,238,0.2)]" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">HealthID</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{label}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
            {description || 'Estamos preparando una experiencia segura para continuar.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.2s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.1s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-cyan-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 text-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} animate-spin rounded-full border-2 border-cyan-400 border-t-transparent`} />
      <span>{label}</span>
    </div>
  )
}

export default Spinner
