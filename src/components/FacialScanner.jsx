import { useEffect, useRef, useState } from 'react'
import CamaraWeb from './CamaraWeb'
import { IconCamera } from './Icons'

const MODEL_URL = '/models'

function FacialScanner({ onDescriptorCaptured, buttonLabel = 'Capturar rostro' }) {
  const videoRef = useRef(null)
  const faceApiRef = useRef(null)
  const [status, setStatus] = useState('Cargando modelos faciales...')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    let stream

    async function setupCamera() {
      try {
        const faceapi = await import('face-api.js')
        faceApiRef.current = faceapi

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])

        if (!mounted) {
          return
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })

        if (!mounted || !videoRef.current) {
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
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

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
      setStatus('Rostro capturado correctamente.')
    } catch (error) {
      setStatus(error.message || 'No se pudo capturar el rostro.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <CamaraWeb videoRef={videoRef} status={status} ready={ready} />
      <button
        type="button"
        onClick={handleCapture}
        disabled={!ready || busy}
        className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 flex items-center justify-center gap-2"
      >
        <IconCamera className="w-5 h-5 shrink-0" />
        <span>{busy ? 'Escaneando...' : buttonLabel}</span>
      </button>
    </div>
  )
}

export default FacialScanner
