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

/* X / Close icon */
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
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('Presiona el botón para iniciar la captura biométrica.')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [captured, setCaptured] = useState(false)
  const actionLabel = captured ? 'Actualizar registro facial' : buttonLabel

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    closeButtonRef.current?.focus()
    const videoElement = videoRef.current
    let mounted = true

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
        setStatus('Cámara lista. Mira al frente y procura buena iluminación.')
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (videoElement) {
        videoElement.srcObject = null
      }
    }
  }, [isOpen])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  function openModal() {
    setStatus('Preparando captura biométrica...')
    setIsOpen(true)
  }

  function closeModal() {
    stopCamera()
    setIsOpen(false)
    setReady(false)
    setBusy(false)
    setStatus(captured
      ? 'Rostro capturado correctamente.'
      : 'Presiona el botón para iniciar la captura biométrica.')
  }

  async function handleCapture() {
    if (!videoRef.current || !ready || !faceApiRef.current) {
      return
    }

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
    } catch (error) {
      setStatus(error.message || 'No se pudo capturar el rostro.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* ── Compact preview card ── */}
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
            onClick={openModal}
            className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/25 focus:outline-none focus:ring-4 focus:ring-teal-100"
          >
            <IconCamera className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">Capturar</span>
          </button>
        </div>
      </div>

      {/* ── Fullscreen modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950"
          role="dialog"
          aria-modal="true"
          aria-labelledby="facial-scanner-title"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-teal-500">
                Biometria facial
              </p>
              <h2 id="facial-scanner-title" className="mt-0.5 text-lg font-black tracking-tight text-white sm:text-xl">
                Registro de rostro
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              aria-label="Cerrar captura facial"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          {/* Camera viewport — centered and expanded */}
          <div className="flex flex-1 items-center justify-center px-4 pb-2 sm:px-8">
            <div className="w-full max-w-3xl">
              <CamaraWeb videoRef={videoRef} status={status} ready={ready} captured={captured} />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex flex-col items-center gap-3 px-4 pb-6 pt-2 sm:pb-8">
            {/* Capture success message */}
            {captured && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-400">
                <IconCheck className="h-4 w-4 shrink-0" />
                <span>Captura facial guardada. Puedes repetir o finalizar.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!ready || busy}
                className="group flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-teal-500 px-8 py-3 text-sm font-black text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-teal-400/30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-teal-400/30"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Escaneando...</span>
                  </>
                ) : (
                  <>
                    <IconCamera className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span>{captured ? 'Repetir captura' : 'Iniciar escaneo'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="min-h-12 cursor-pointer rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {captured ? 'Finalizar' : 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacialScanner
