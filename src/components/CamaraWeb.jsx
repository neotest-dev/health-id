function CamaraWeb({ videoRef, status, ready, captured }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950">
      {/* Video feed */}
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Dark gradient overlay for contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40" />

        {/* Wireframe mesh overlay */}
        <div className="animate-grid-pulse pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 200 260"
            className="h-[75%] w-auto"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          >
            <g className="text-teal-400/50">
              {/* Face outline */}
              <ellipse cx="100" cy="120" rx="68" ry="88" />
              <ellipse cx="100" cy="120" rx="58" ry="78" />

              {/* Forehead horizontal lines */}
              <line x1="55" y1="60" x2="145" y2="60" />
              <line x1="48" y1="75" x2="152" y2="75" />
              <line x1="42" y1="90" x2="158" y2="90" />

              {/* Eye region */}
              <ellipse cx="72" cy="105" rx="18" ry="10" />
              <ellipse cx="128" cy="105" rx="18" ry="10" />
              <line x1="90" y1="105" x2="110" y2="105" />

              {/* Nose */}
              <line x1="100" y1="95" x2="100" y2="140" />
              <line x1="88" y1="138" x2="100" y2="140" />
              <line x1="112" y1="138" x2="100" y2="140" />

              {/* Mouth */}
              <ellipse cx="100" cy="160" rx="22" ry="8" />
              <line x1="78" y1="160" x2="122" y2="160" />

              {/* Jawline details */}
              <line x1="38" y1="105" x2="55" y2="105" />
              <line x1="145" y1="105" x2="162" y2="105" />
              <line x1="42" y1="120" x2="55" y2="120" />
              <line x1="145" y1="120" x2="158" y2="120" />

              {/* Chin */}
              <line x1="60" y1="190" x2="140" y2="190" />

              {/* Vertical grid lines */}
              <line x1="70" y1="50" x2="70" y2="200" strokeDasharray="3 6" />
              <line x1="100" y1="32" x2="100" y2="208" strokeDasharray="2 8" />
              <line x1="130" y1="50" x2="130" y2="200" strokeDasharray="3 6" />

              {/* Horizontal grid lines */}
              <line x1="32" y1="105" x2="168" y2="105" strokeDasharray="3 6" />
              <line x1="32" y1="140" x2="168" y2="140" strokeDasharray="3 6" />
              <line x1="38" y1="170" x2="162" y2="170" strokeDasharray="3 6" />

              {/* Reference points */}
              <circle cx="72" cy="105" r="2" fill="currentColor" />
              <circle cx="128" cy="105" r="2" fill="currentColor" />
              <circle cx="100" cy="140" r="2" fill="currentColor" />
              <circle cx="100" cy="160" r="2" fill="currentColor" />
              <circle cx="100" cy="50" r="2" fill="currentColor" />
              <circle cx="100" cy="200" r="2" fill="currentColor" />
            </g>
          </svg>
        </div>

        {/* Corner brackets with glow */}
        <div className="pointer-events-none absolute inset-6 sm:inset-10">
          <div className="absolute -left-px -top-px h-8 w-8 border-l-2 border-t-2 border-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
          <div className="absolute -right-px -top-px h-8 w-8 border-r-2 border-t-2 border-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
          <div className="absolute -bottom-px -left-px h-8 w-8 border-b-2 border-l-2 border-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
          <div className="absolute -bottom-px -right-px h-8 w-8 border-b-2 border-r-2 border-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
        </div>

        {/* Scan line */}
        {ready && !captured && (
          <div className="animate-scan-line pointer-events-none absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_16px_4px_rgba(20,184,166,0.4)] sm:left-10 sm:right-10" />
        )}

        {/* Success flash overlay */}
        {captured && (
          <div className="animate-scan-complete pointer-events-none absolute inset-0 rounded-2xl" />
        )}

        {/* HUD tech overlays */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6">
          <span className={`h-2 w-2 rounded-full ${ready ? 'bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.7)]' : 'animate-pulse bg-amber-400'}`} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/70">
            {ready ? 'SISTEMA LISTO' : 'INICIANDO'}
          </span>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 font-mono text-[10px] text-white/50 sm:right-6 sm:top-6">
          BIO.SCAN v2.1
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 font-mono text-[10px] text-white/50 sm:bottom-6 sm:left-6">
          DEPTH: AUTO / RGB
        </div>

        {/* Center alignment text */}
        {ready && !captured && (
          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 sm:top-10">
            <span className="rounded-full bg-slate-950/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-teal-300 backdrop-blur-sm">
              Alinear rostro
            </span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2.5 border-t border-white/10 bg-slate-900 px-4 py-2.5 text-xs text-slate-400 sm:px-6">
        <svg className="h-4 w-4 shrink-0 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-5">{status}</span>
      </div>
    </div>
  )
}

export default CamaraWeb
