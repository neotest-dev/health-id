import { allowMethods, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
    const { data: disponibilidades, error } = await supabase
      .from('disponibilidades')
      .select('id, fecha, cupos_totales, cupos_disponibles, activa, doctor_profile_id, especialidad_id')
      .order('fecha', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const doctorIds = [...new Set((disponibilidades || []).map((item) => item.doctor_profile_id).filter(Boolean))]
    const especialidadIds = [...new Set((disponibilidades || []).map((item) => item.especialidad_id).filter(Boolean))]

    const [doctorsResult, specialtiesResult] = await Promise.all([
      doctorIds.length
        ? supabase.from('profiles').select('id, dni, full_name').in('id', doctorIds)
        : Promise.resolve({ data: [], error: null }),
      especialidadIds.length
        ? supabase.from('especialidades').select('id, nombre').in('id', especialidadIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (doctorsResult.error) {
      throw new Error(doctorsResult.error.message)
    }

    if (specialtiesResult.error) {
      throw new Error(specialtiesResult.error.message)
    }

    const doctorsById = new Map((doctorsResult.data || []).map((doctor) => [doctor.id, doctor]))
    const specialtiesById = new Map((specialtiesResult.data || []).map((item) => [item.id, item.nombre]))

    return sendJson(res, 200, {
      disponibilidades: (disponibilidades || []).map((item) => {
        const doctor = doctorsById.get(item.doctor_profile_id)

        return {
          id: item.id,
          fecha: item.fecha,
          cupos_totales: item.cupos_totales,
          cupos_disponibles: item.cupos_disponibles,
          activa: item.activa,
          doctor: doctor?.full_name || doctor?.dni || 'Sin doctor',
          especialidad: specialtiesById.get(item.especialidad_id) || 'Sin especialidad',
        }
      }),
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudieron listar las disponibilidades.' })
  }
}
