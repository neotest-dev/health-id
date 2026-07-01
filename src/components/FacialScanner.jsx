import { useEffect, useRef, useState } from 'react'
import CamaraWeb from './CamaraWeb'
import { IconCamera, IconCheck } from './Icons'

const MODEL_URL = '/models'

/* Scan face icon for the preview card */
function IconScanFace({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3H5a2 2 0 00-2 2v2m0 10v2a2 2 0 002 2h2m10-18h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2" />
      <circle cx="12" cy="10" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
    </svg>
  )
}

/* Arrow left icon */
function IconArrowLeft({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function FacialScanner({ onDescriptorCaptured, buttonLabel = 'Capturar rostro' }) {
  const videoRef = useRef(null)
  const faceApiRef = useRef(null)
  const streamRef = useRef(null)
  const backButtonRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState('Presiona el botón para iniciar la captura biométrica.')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [captured, setCaptured] = useState(false)
  const actionLabel = captured ? 'Actualizar registro facial' : buttonLabel

  useEffect(() => {
    if (!scanning) return undefined

    backButtonRef.current?.focus()
    const videoElement = videoRef.current
    let mounted = true

    // Lock body scroll while scanning
    document.body.style.overflow = 'hidden'

    async function setupCamera() {
      setReady(false)
      setStatus('Cargando modelos faciales seguros...')

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
        setStatus('Cámara lista. Centra tu rostro y procura buena iluminación.')
        setReady(true)
      } catch (error) {
        setStatus(error.message.includes('fetch')
          ? 'No se encontraron los modelos en public/models. Revisa la guía del proyecto.'
          : 'No se pudo iniciar la cámara o cargar los modelos faciales.')
      }
    }

    setupCamera()

    return () => {
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

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  function startScanning() {
    setStatus('Preparando captura biométrica...')
    setScanning(true)
  }

  function stopScanning() {
    stopCamera()
    setScanning(false)
    setReady(false)
    setBusy(false)
    setStatus(captured
      ? 'Rostro capturado correctamente.'
      : 'Presiona el botón para iniciar la captura biométrica.')
  }

  async function handleCapture() {
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

      // Return to form automatically after a brief success feedback
      setTimeout(() => {
        stopScanning()
      }, 1200)
    } catch (error) {
      setStatus(error.message || 'No se pudo capturar el rostro.')
      setBusy(false)
    }
  }

  /* ── Scanning view (replaces entire viewport) ── */
  if (scanning) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
        {/* Top bar */}
        <div className="relative z-10 flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <button
            ref={backButtonRef}
            type="button"
            onClick={stopScanning}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            aria-label="Volver al formulario"
          >
            <IconArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-400">
              Biometria facial
            </p>
            <h2 className="text-base font-black tracking-tight text-white sm:text-lg">
              Escaneo de rostro
            </h2>
          </div>
        </div>

        {/* Camera viewport — fills available space */}
        <div className="flex flex-1 items-center justify-center px-3 sm:px-6">
          <div className="w-full max-w-2xl">
            <CamaraWeb videoRef={videoRef} status={status} ready={ready} captured={captured} />
          </div>
        </div>

        {/* Bottom action */}
        <div className="flex flex-col items-center gap-3 px-4 pb-6 pt-3 sm:pb-8">
          {captured ? (
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <IconCheck className="h-5 w-5 shrink-0" />
              <span>Captura exitosa. Regresando...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!ready || busy}
              className="group flex min-h-14 w-full max-w-xs cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-teal-500 px-6 py-3.5 text-base font-black text-white shadow-lg shadow-teal-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-teal-400/35 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-teal-400/30 sm:w-auto sm:min-w-[220px]"
            >
              {busy ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Escaneando...</span>
                </>
              ) : (
                <>
                  <IconCamera className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  <span>Iniciar escaneo</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── Compact preview card (inline in form) ── */
  return (
    <div className="animate-fade-up">
      <div className={`relative overflow-hidden rounded-2xl border px-4 py-4 shadow-sm transition-all duration-300 sm:px-5 ${captured ? 'border-emerald-200 bg-emerald-50/50' : 'border-teal-100 bg-white'}`}>
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${captured ? 'bg-emerald-100 text-emerald-600' : 'bg-teal-50 text-teal-600'}`}>
            {captured
              ? <IconCheck className="h-6 w-6" />
              : <IconScanFace className="h-6 w-6" />
            }
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Identidad facial
            </p>
            <p className={`mt-0.5 text-sm font-bold ${captured ? 'text-emerald-700' : 'text-slate-700'}`}>
              {captured ? 'Rostro registrado' : 'Pendiente de captura'}
            </p>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={startScanning}
            className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-100"
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
