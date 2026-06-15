import { allowMethods, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, dni, full_name')
      .eq('role', 'doctor')
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw new Error(profilesError.message)
    }

    const doctorIds = (profiles || []).map((doctor) => doctor.id)
    let detailsByProfileId = new Map()

    if (doctorIds.length) {
      const { data: details, error: detailsError } = await supabase
        .from('doctor_details')
        .select('profile_id, turno, especialidad_id')
        .in('profile_id', doctorIds)

      if (detailsError) {
        throw new Error(detailsError.message)
      }

      const especialidadIds = [...new Set((details || []).map((detail) => detail.especialidad_id).filter(Boolean))]
      let specialtiesById = new Map()

      if (especialidadIds.length) {
        const { data: especialidades, error: specialtiesError } = await supabase
          .from('especialidades')
          .select('id, nombre')
          .in('id', especialidadIds)

        if (specialtiesError) {
          throw new Error(specialtiesError.message)
        }

        specialtiesById = new Map((especialidades || []).map((especialidad) => [especialidad.id, especialidad.nombre]))
      }

      detailsByProfileId = new Map(
        (details || []).map((detail) => [
          detail.profile_id,
          {
            turno: detail.turno,
            especialidadId: detail.especialidad_id || null,
            especialidad: detail.especialidad_id ? specialtiesById.get(detail.especialidad_id) || null : null,
          },
        ]),
      )
    }

    return sendJson(res, 200, {
      doctores: (profiles || []).map((doctor) => ({
        id: doctor.id,
        dni: doctor.dni,
        full_name: doctor.full_name,
        turno: detailsByProfileId.get(doctor.id)?.turno || null,
        especialidad_id: detailsByProfileId.get(doctor.id)?.especialidadId || null,
        especialidad: detailsByProfileId.get(doctor.id)?.especialidad || null,
      })),
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudieron listar los doctores.' })
  }
}
