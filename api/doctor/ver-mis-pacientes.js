import { allowMethods, requireProfile, sendJson } from '../../lib/api-utils/request.js'

function applyTimingHeaders(res, timings) {
  res.setHeader('x-healthid-auth-verify-jwt', String(timings.verifyJwt || 0))
  res.setHeader('x-healthid-auth-load-profile', String(timings.loadProfile || 0))
  res.setHeader('x-healthid-auth-total', String(timings.authTotal || 0))
  res.setHeader('x-healthid-dashboard-parallel-queries', String(timings.parallelQueries || 0))
  res.setHeader('x-healthid-dashboard-total', String(timings.total || 0))
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  const totalStartedAt = Date.now()
  const timings = {
    verifyJwt: 0,
    loadProfile: 0,
    authTotal: 0,
    parallelQueries: 0,
    total: 0,
  }

  function respond(status, payload) {
    timings.total = Date.now() - totalStartedAt
    applyTimingHeaders(res, timings)
    return sendJson(res, status, payload)
  }

  try {
    const authStartedAt = Date.now()
    const authTimings = {}
    const { profile, supabase } = await requireProfile(req, ['doctor'], authTimings)
    timings.verifyJwt = authTimings.verifyJwt || 0
    timings.loadProfile = authTimings.loadProfile || 0
    timings.authTotal = Date.now() - authStartedAt

    const queriesStartedAt = Date.now()
    const [detailsResult, citasResult] = await Promise.all([
      supabase
        .from('doctor_details')
        .select('turno, especialidades(nombre)')
        .eq('profile_id', profile.id)
        .single(),
      supabase
        .from('citas')
        .select('id, codigo, estado, created_at, fecha_cita, especialidades(nombre)')
        .eq('doctor_profile_id', profile.id)
        .order('fecha_cita', { ascending: true })
        .order('created_at', { ascending: false }),
    ])
    timings.parallelQueries = Date.now() - queriesStartedAt

    const { data: details, error: detailsError } = detailsResult
    const { data: citas, error: citasError } = citasResult

    if (detailsError) {
      throw new Error(detailsError.message)
    }

    if (citasError) {
      throw new Error(citasError.message)
    }

    const pendientes = (citas || []).filter((cita) => cita.estado === 'pendiente' || cita.estado === 'programada').length
    const atendidas = (citas || []).filter((cita) => cita.estado === 'atendida').length

    return respond(200, {
      doctor: {
        fullName: profile.full_name,
        turno: details.turno,
        especialidad: details.especialidades?.nombre || 'Sin especialidad',
      },
      summary: {
        total: citas?.length || 0,
        pendientes,
        atendidas,
      },
      citas: (citas || []).map((cita) => ({
        ...cita,
        especialidad: cita.especialidades?.nombre || 'Sin especialidad',
      })),
    })
  } catch (error) {
    return respond(500, { error: error.message || 'No se pudo cargar el dashboard del doctor.' })
  }
}
