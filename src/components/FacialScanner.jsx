import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CamaraWeb from './CamaraWeb'
import { IconCamera, IconCheck } from './Icons'

const MODEL_URL = '/models'

function IconScanFace({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3H5a2 2 0 00-2 2v2m0 10v2a2 2 0 002 2h2m10-18h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" />
      <circle cx="12" cy="10" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

function IconX({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function FacialScanner({ onDescriptorCaptured, buttonLabel = 'Capturar rostro' }) {
  const videoRef = useRef(null)
  const faceApiRef = useRef(null)
  const streamRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState('Presiona el botón para iniciar la captura biométrica.')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [captured, setCaptured] = useState(false)
  const actionLabel = captured ? 'Actualizar registro facial' : buttonLabel

  useEffect(() => {
    if (!scanning) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        setScanning(false)
        setReady(false)
        setBusy(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()
    const videoElement = videoRef.current
    let mounted = true

    document.body.style.overflow = 'hidden'

    async function setupCamera() {
      setReady(false)
      setStatus('Cargando modelos faciales...')

      try {
        if (!faceApiRef.current) {
          const faceapi = await import('face-api.js')
          faceApiRef.current = faceapi

          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          ])
        }

        if (!mounted) return

        setStatus('Solicitando permiso de cámara...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        streamRef.current = stream

        if (!mounted || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        videoRef.current.srcObject = stream
        setStatus('Cámara lista. Centra tu rostro con buena iluminación.')
        setReady(true)
      } catch (error) {
        setStatus(error.message.includes('fetch')
          ? 'No se encontraron los modelos en public/models.'
          : 'No se pudo iniciar la cámara o cargar los modelos faciales.')
      }
    }

    setupCamera()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      mounted = false
      document.body.style.overflow = ''

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [scanning])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startScanning = useCallback(() => {
    setStatus('Preparando captura biométrica...')
    setScanning(true)
  }, [])

  const stopScanning = useCallback(() => {
    stopCamera()
    setScanning(false)
    setReady(false)
    setBusy(false)
    setStatus(captured
      ? 'Rostro capturado correctamente.'
      : 'Presiona el botón para iniciar la captura biométrica.')
  }, [stopCamera, captured])

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !ready || !faceApiRef.current) return

    setBusy(true)
    setStatus('Analizando rostro...')

    try {
      const faceapi = faceApiRef.current
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        throw new Error('No se detectó un rostro válido.')
      }

      const descriptor = Array.from(detection.descriptor)
      onDescriptorCaptured(descriptor)
      setCaptured(true)
      setStatus('Rostro capturado correctamente.')

      setTimeout(() => {
        stopScanning()
      }, 1200)
    } catch (error) {
      setStatus(error.message || 'No se pudo capturar el rostro.')
      setBusy(false)
    }
  }, [ready, onDescriptorCaptured, stopScanning])

  /* ── Centered scanning modal (Rendered with React Portal to center on viewport) ── */
  if (scanning) {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-teal-950/80 p-3 backdrop-blur-md sm:p-4">
        <div className="animate-modal-in w-full max-w-xl">
          <div className="overflow-hidden rounded-[2rem] border border-teal-800/40 bg-gradient-to-b from-[#042f2e] to-[#022c22] shadow-[0_0_80px_rgba(4,47,46,0.5)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-teal-800/30 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                  <IconCamera className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-400/80">
                    Biometría facial
                  </p>
                  <h2 className="text-base font-black tracking-tight text-white">
                    Escaneo de rostro
                  </h2>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={stopScanning}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-teal-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                aria-label="Cerrar escáner"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* Camera */}
            <div className="p-2 sm:p-3 lg:p-4">
              <CamaraWeb
                videoRef={videoRef}
                status={status}
                ready={ready}
                captured={captured}
                busy={busy}
              />
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-center border-t border-teal-800/30 px-5 py-4">
              {captured ? (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  <span className="text-sm font-bold text-emerald-400">Captura exitosa. Cerrando...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={!ready || busy}
                  className="group flex min-h-12 w-full max-w-[220px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/20 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-teal-950 disabled:border disabled:border-teal-800/50 disabled:text-teal-900/50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-teal-400/40 active:translate-y-0"
                >
                  {busy ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Escaneando...</span>
                    </>
                  ) : (
                    <>
                      <IconCamera className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span>Iniciar escaneo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  /* ── Preview card (inline in form) ── */
  return (
    <div className="animate-fade-up">
      <div
        className={`relative overflow-hidden rounded-xl border-2 transition-all duration-500 ${
          captured
            ? 'animate-capture-pulse border-emerald-300 bg-gradient-to-br from-emerald-50 to-white'
            : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-md'
        }`}
      >
        {captured && (
          <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />
        )}

        <div className="relative flex items-center gap-4 px-4 py-4 sm:px-5">
          {/* Icon */}
          <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
              captured
                ? 'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-200'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {captured ? (
              <span className="scale-100 transition-transform duration-300">
                <IconCheck className="h-6 w-6" />
              </span>
            ) : (
              <IconScanFace className="h-6 w-6" />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Identidad facial
            </p>
            <p
              className={`mt-0.5 text-sm font-bold transition-colors ${
                captured ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {captured ? 'Rostro registrado' : 'Pendiente de captura'}
            </p>
            {captured && (
              <p className="mt-0.5 text-xs font-medium text-emerald-500">
                Listo para continuar
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={startScanning}
            className={`group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all duration-200 focus:outline-none focus:ring-4 ${
              captured
                ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 focus:ring-emerald-200'
                : 'bg-teal-600 text-white shadow-teal-600/15 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/25 focus:ring-teal-100'
            }`}
          >
            <IconCamera className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">Capturar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FacialScanner
