function CamaraWeb({ videoRef, status, ready }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl shadow-teal-950/10">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-600">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${ready ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
          <span>Cámara Facial</span>
        </div>
        <span className={`font-bold ${ready ? 'text-emerald-600' : 'text-amber-600'}`}>
          {ready ? 'Activa' : 'Iniciando'}
        </span>
      </div>

      {/* Video / HUD Viewport */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover opacity-90 transition-opacity" />
        
        {/* HUD Elements */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Circular facial target frame */}
          <div className="relative flex h-[70%] aspect-square items-center justify-center rounded-full border border-dashed border-teal-300/70">
            {/* Inner secondary circle */}
            <div className="h-[90%] aspect-square rounded-full border border-teal-200/30" />
            
            {/* Center target reticle */}
            <div className="absolute h-4 w-px bg-teal-300/70" />
            <div className="absolute h-px w-4 bg-teal-300/70" />

            {/* Corner brackets inside circle */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-teal-100/80">
              Alinear Rostro
            </div>
          </div>
          
          {/* Biometric corner brackets */}
          <div className="absolute inset-8 border border-teal-300/25">
            {/* Top-Left Bracket */}
            <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-teal-300" />
            {/* Top-Right Bracket */}
            <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-teal-300" />
            {/* Bottom-Left Bracket */}
            <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-teal-300" />
            {/* Bottom-Right Bracket */}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-teal-300" />
          </div>

          {/* Animated Scanning Line */}
          {ready && (
            <div className="absolute left-8 right-8 top-8 h-[2px] animate-[bounce_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-80 shadow-[0_0_8px_#5eead4]" />
          )}

          {/* Tech overlay texts */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 font-mono text-[9px] text-slate-300/80">
            <span>SYS.STATUS: {ready ? 'OK' : 'WAIT'}</span>
            <span>SYS.DEPTH: AUTO</span>
          </div>
          <div className="absolute bottom-4 right-4 font-mono text-[9px] text-slate-300/80">
            <span>FPS: 30 / RGB</span>
          </div>
        </div>
      </div>

      {/* Footer / Status description */}
      <div className="border-t border-teal-100 bg-white px-4 py-3 text-xs font-medium text-slate-600 md:text-sm">
        <div className="flex items-start gap-2.5">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="leading-5">{status}</span>
        </div>
      </div>
    </div>
  )
}

export default CamaraWeb
