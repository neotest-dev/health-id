import { allowMethods, readJson, requireProfile, sendJson } from '../lib/api-utils/request.js'
import { resolvePatientByDniAndFace } from '../lib/api-utils/patients.js'
import { getAdminSupabase } from '../lib/api-utils/supabase.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const { profile } = await requireProfile(req, ['doctor'])
    const body = await readJson(req)
    const { dni, descriptorFacial } = body

    if (!dni || !Array.isArray(descriptorFacial)) {
      return sendJson(res, 400, { error: 'DNI y descriptor facial son obligatorios.' })
    }

    const { datos, cita } = await resolvePatientByDniAndFace(dni, descriptorFacial)

    if (!cita || cita.doctor_profile_id !== profile.id) {
      return sendJson(res, 403, { error: 'Este paciente no pertenece al turno del doctor autenticado.' })
    }

    const supabase = getAdminSupabase()

    await supabase
      .from('citas')
      .update({ estado: 'atendida' })
      .eq('id', cita.id)

    return sendJson(res, 200, {
      ok: true,
      paciente: datos,
      cita: {
        ...cita,
        estado: 'atendida',
      },
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo verificar el rostro.' })
  }
}
