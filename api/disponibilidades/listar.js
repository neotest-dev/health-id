import { allowMethods, sendJson } from '../../lib/api-utils/request.js'
import { getAdminSupabase } from '../../lib/api-utils/supabase.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const especialidadId = req.query?.especialidadId

    if (!especialidadId) {
      return sendJson(res, 400, { error: 'La especialidad es obligatoria.' })
    }

    const supabase = getAdminSupabase()
    const today = new Date().toISOString().slice(0, 10)
    const { data: disponibilidades, error } = await supabase
      .from('disponibilidades')
      .select('id, fecha, cupos_totales, cupos_disponibles, doctor_profile_id')
      .eq('especialidad_id', especialidadId)
      .eq('activa', true)
      .gt('cupos_disponibles', 0)
      .gte('fecha', today)
      .order('fecha', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const doctorIds = [...new Set((disponibilidades || []).map((item) => item.doctor_profile_id).filter(Boolean))]
    const { data: doctors, error: doctorsError } = doctorIds.length
      ? await supabase.from('profiles').select('id, full_name, dni').in('id', doctorIds)
      : { data: [], error: null }

    if (doctorsError) {
      throw new Error(doctorsError.message)
    }

    const doctorsById = new Map((doctors || []).map((doctor) => [doctor.id, doctor]))

    return sendJson(res, 200, {
      disponibilidades: (disponibilidades || []).map((item) => {
        const doctor = doctorsById.get(item.doctor_profile_id)

        return {
          id: item.id,
          fecha: item.fecha,
          cuposTotales: item.cupos_totales,
          cuposDisponibles: item.cupos_disponibles,
          doctor: doctor?.full_name || doctor?.dni || 'Doctor disponible',
        }
      }),
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudieron listar las fechas disponibles.' })
  }
}
