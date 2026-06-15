function CamaraWeb({ videoRef, status, ready }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-[0_30px_60px_rgba(2,6,23,0.35)]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${ready ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-ping'}`} />
          <span>Cámara Facial</span>
        </div>
        <span className={`font-bold ${ready ? 'text-emerald-400' : 'text-amber-400'}`}>
          {ready ? 'Activa' : 'Iniciando'}
        </span>
      </div>

      {/* Video / HUD Viewport */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover opacity-90 transition-opacity" />
        
        {/* HUD Elements */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Circular facial target frame */}
          <div className="relative h-[70%] aspect-square rounded-full border border-dashed border-cyan-500/35 flex items-center justify-center">
            {/* Inner secondary circle */}
            <div className="h-[90%] aspect-square rounded-full border border-cyan-500/10" />
            
            {/* Center target reticle */}
            <div className="absolute h-4 w-px bg-cyan-400/50" />
            <div className="absolute w-4 h-px bg-cyan-400/50" />

            {/* Corner brackets inside circle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-cyan-400/60 font-mono tracking-widest uppercase">
              Alinear Rostro
            </div>
          </div>
          
          {/* Biometric corner brackets */}
          <div className="absolute inset-8 border border-cyan-500/20">
            {/* Top-Left Bracket */}
            <div className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-cyan-400" />
            {/* Top-Right Bracket */}
            <div className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-cyan-400" />
            {/* Bottom-Left Bracket */}
            <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-cyan-400" />
            {/* Bottom-Right Bracket */}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-cyan-400" />
          </div>

          {/* Animated Scanning Line */}
          {ready && (
            <div className="absolute left-8 right-8 top-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] opacity-70 animate-[bounce_4s_ease-in-out_infinite]" />
          )}

          {/* Tech overlay texts */}
          <div className="absolute bottom-4 left-4 font-mono text-[9px] text-slate-500 flex flex-col gap-0.5">
            <span>SYS.STATUS: {ready ? 'OK' : 'WAIT'}</span>
            <span>SYS.DEPTH: AUTO</span>
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[9px] text-slate-500">
            <span>FPS: 30 / RGB</span>
          </div>
        </div>
      </div>

      {/* Footer / Status description */}
      <div className="border-t border-slate-800 bg-slate-900/20 px-4 py-3 text-xs md:text-sm text-slate-300 font-medium">
        <div className="flex items-start gap-2.5">
          <svg className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-5">{status}</span>
        </div>
      </div>
    </div>
  )
}

export default CamaraWeb
