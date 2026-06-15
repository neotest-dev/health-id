import { allowMethods, readJson, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
    const { doctorProfileId, fecha, cuposTotales } = await readJson(req)

    if (!doctorProfileId || !fecha || !cuposTotales) {
      return sendJson(res, 400, { error: 'Doctor, fecha y cupos son obligatorios.' })
    }

    const total = Number(cuposTotales)

    if (!Number.isInteger(total) || total <= 0) {
      return sendJson(res, 400, { error: 'Los cupos deben ser un numero entero mayor a cero.' })
    }

    const today = new Date().toISOString().slice(0, 10)

    if (fecha < today) {
      return sendJson(res, 400, { error: 'No puedes crear disponibilidad en una fecha pasada.' })
    }

    const { data: doctorDetail, error: doctorDetailError } = await supabase
      .from('doctor_details')
      .select('especialidad_id')
      .eq('profile_id', doctorProfileId)
      .single()

    if (doctorDetailError || !doctorDetail?.especialidad_id) {
      return sendJson(res, 400, { error: 'El doctor seleccionado no tiene una especialidad valida asignada.' })
    }

    const { data, error } = await supabase
      .from('disponibilidades')
      .insert({
        doctor_profile_id: doctorProfileId,
        especialidad_id: doctorDetail.especialidad_id,
        fecha,
        cupos_totales: total,
        cupos_disponibles: total,
        activa: true,
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return sendJson(res, 201, { ok: true, disponibilidad: data })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo crear la disponibilidad.' })
  }
}
