import { useEffect, useRef, useState } from 'react'
import CamaraWeb from './CamaraWeb'
import { IconCamera, IconCheck } from './Icons'

const MODEL_URL = '/models'

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
  const stateLabel = captured ? 'Rostro registrado' : 'Pendiente de captura'
  const stateDescription = captured
    ? 'El descriptor facial quedó asociado a este flujo. Puedes repetirlo si la captura no fue clara.'
    : 'La cámara se abrirá solo cuando autorices el registro facial.'

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
      <div className="relative overflow-hidden rounded-[1.75rem] border border-teal-100 bg-white p-5 shadow-lg shadow-teal-950/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-cyan-100/80 blur-3xl" />
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center rounded-[2rem] border border-teal-100 bg-teal-50/80">
            <div className="absolute h-[74%] w-[74%] rounded-full border border-teal-200" />
            <div className="absolute h-[54%] w-[54%] rounded-full bg-white shadow-inner" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-teal-950 text-teal-100 shadow-2xl shadow-teal-950/20">
              <span className="absolute h-16 w-px rounded-full bg-teal-300/40" />
              <span className="absolute h-px w-16 rounded-full bg-teal-300/40" />
              <IconCamera className="h-8 w-8" />
            </div>
            <div className="animate-biometric-scan absolute left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_rgba(16,185,129,0.35)]" />
            <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${captured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {captured ? 'OK' : 'Paso 1'}
            </span>
          </div>

          <div className="relative space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-700">Identidad facial</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{stateLabel}</h3>
              <p className="mt-2 text-sm font-medium leading-7 text-slate-600">{stateDescription}</p>
            </div>

            <div className="grid gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-700">1</span>
                <span>Autoriza la cámara desde el modal.</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-700">2</span>
                <span>Centra el rostro con buena iluminación.</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openModal}
                className="group flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-600/30 focus:outline-none focus:ring-4 focus:ring-teal-100"
              >
                <IconCamera className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
                <span>{actionLabel}</span>
              </button>
              {captured && (
                <div className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <IconCheck className="h-5 w-5 shrink-0" />
                  <span>Listo para continuar</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-teal-950/45 px-4 py-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true" aria-labelledby="facial-scanner-title">
          <div className="animate-modal-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-teal-100 bg-white p-4 shadow-2xl shadow-slate-900/25 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-600">Biometría facial</p>
                <h2 id="facial-scanner-title" className="mt-2 text-2xl font-black tracking-tight text-slate-950">Registrar rostro</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">La cámara se activa solo mientras este modal está abierto. Cierra para apagarla.</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-100"
                aria-label="Cerrar captura facial"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <CamaraWeb videoRef={videoRef} status={status} ready={ready} />

            {captured && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-black">Captura facial guardada</p>
                  <p className="mt-1 leading-6">Puedes finalizar o repetir la captura si necesitas una toma más clara.</p>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!ready || busy}
                className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-colors duration-200 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-4 focus:ring-teal-100"
              >
                <IconCamera className="w-5 h-5 shrink-0" />
                <span>{busy ? 'Escaneando...' : captured ? 'Repetir captura' : 'Capturar rostro ahora'}</span>
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="min-h-12 cursor-pointer rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
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
