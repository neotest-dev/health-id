function CamaraWeb({ videoRef, status, ready, captured, busy }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-teal-950 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal-950/75 via-transparent to-teal-950/50" />

        {/* Subtle scanline CRT effect */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]" />

        {/* Wireframe mesh overlay */}
        <div className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-30'}`}>
          <svg
            viewBox="0 0 200 260"
            className={`h-[75%] w-auto transition-all duration-700 ${ready && !captured ? 'animate-wireframe-breathe' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.4"
          >
            <g className="text-teal-400/30">
              {/* Face outline */}
              <ellipse cx="100" cy="120" rx="68" ry="88" strokeWidth="0.5" />
              <ellipse cx="100" cy="120" rx="58" ry="78" strokeWidth="0.3" />

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
              <line x1="145" y1="120" x2="162" y2="120" />

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

              {/* Reference points with staggered pulse */}
              <g className={ready && !captured ? 'animate-ref-dot' : ''}>
                <circle cx="72" cy="105" r="2" fill="currentColor" />
                <circle cx="128" cy="105" r="2" fill="currentColor" />
              </g>
              <g className={ready && !captured ? 'animate-ref-dot' : ''} style={{ animationDelay: '0.4s' }}>
                <circle cx="100" cy="140" r="2" fill="currentColor" />
              </g>
              <g className={ready && !captured ? 'animate-ref-dot' : ''} style={{ animationDelay: '0.8s' }}>
                <circle cx="100" cy="160" r="2" fill="currentColor" />
              </g>
              <g className={ready && !captured ? 'animate-ref-dot' : ''} style={{ animationDelay: '1.2s' }}>
                <circle cx="100" cy="50" r="2" fill="currentColor" />
                <circle cx="100" cy="200" r="2" fill="currentColor" />
              </g>
            </g>
          </svg>
        </div>

        {/* Corner brackets with dynamic glow */}
        <div className="pointer-events-none absolute inset-5 sm:inset-8">
          <div className={`absolute -left-px -top-px h-7 w-7 border-l-[1.5px] border-t-[1.5px] border-teal-400 transition-all duration-500 ${ready && !captured ? 'animate-bracket-glow' : 'opacity-40'}`} />
          <div className={`absolute -right-px -top-px h-7 w-7 border-r-[1.5px] border-t-[1.5px] border-teal-400 transition-all duration-500 ${ready && !captured ? 'animate-bracket-glow' : 'opacity-40'}`} />
          <div className={`absolute -bottom-px -left-px h-7 w-7 border-b-[1.5px] border-l-[1.5px] border-teal-400 transition-all duration-500 ${ready && !captured ? 'animate-bracket-glow' : 'opacity-40'}`} />
          <div className={`absolute -bottom-px -right-px h-7 w-7 border-b-[1.5px] border-r-[1.5px] border-teal-400 transition-all duration-500 ${ready && !captured ? 'animate-bracket-glow' : 'opacity-40'}`} />
        </div>

        {/* Scan line - dynamic speed */}
        {ready && !captured && !busy && (
          <div className="animate-scan-line pointer-events-none absolute left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_20px_6px_rgba(20,184,166,0.4)] sm:left-8 sm:right-8" />
        )}
        {ready && !captured && busy && (
          <div className="animate-scan-busy pointer-events-none absolute left-5 right-5 h-[2px] bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_25px_8px_rgba(20,184,166,0.6)] sm:left-8 sm:right-8" />
        )}

        {/* Ring expand on capture */}
        {captured && (
          <div className="animate-ring-expand pointer-events-none absolute left-1/2 top-1/2 z-10 h-12 w-12 rounded-full border-2 border-emerald-400 shadow-[0_0_30px_rgba(5,150,105,0.5)]" />
        )}

        {/* Success flash overlay */}
        {captured && (
          <div className="animate-scan-complete pointer-events-none absolute inset-0 z-20 rounded-xl" />
        )}

        {/* HUD tech overlays */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 sm:left-5 sm:top-5">
          <span className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${ready ? 'bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]' : 'animate-pulse bg-amber-400'}`} />
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/60">
            {ready ? 'SISTEMA LISTO' : 'INICIANDO'}
          </span>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 font-mono text-[9px] text-white/40 sm:right-5 sm:top-5">
          BIO.SCAN v2.1
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[9px] text-white/40 sm:bottom-5 sm:left-5">
          DEPTH: AUTO / RGB
        </div>

        {/* Center alignment badge */}
        {ready && !captured && !busy && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 sm:top-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-950/80 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-teal-300 backdrop-blur-sm shadow-[0_0_12px_rgba(0,0,0,0.3)]">
              <span className="h-1 w-1 rounded-full bg-teal-400 animate-pulse" />
              Alinear rostro
            </span>
          </div>
        )}

        {/* Scanning indicator when busy */}
        {busy && (
          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 sm:top-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-950/80 px-3 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-amber-400 backdrop-blur-sm shadow-[0_0_12px_rgba(0,0,0,0.3)]">
              <span className="h-1 w-1 rounded-full bg-amber-400 animate-ping" />
              Escaneando
            </span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2.5 border-t border-white/5 bg-[#032423] px-4 py-2.5 text-[11px] text-teal-300/80 sm:px-5">
        <svg className="h-3.5 w-3.5 shrink-0 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="leading-5">{status}</span>
      </div>
    </div>
  )
}

export default CamaraWeb
