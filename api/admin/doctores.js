import { allowMethods, readJson, requireProfile, sendJson } from '../../lib/api-utils/request.js'

function doctorEmailFromDni(dni) {
  return `${String(dni).trim()}@doctor.healthid.local`
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])

    if (req.method === 'GET') {
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
    }

    const { dni, fullName, especialidadId, turno } = await readJson(req)

    if (!dni || !especialidadId || !turno) {
      return sendJson(res, 400, { error: 'DNI, especialidad y turno son obligatorios.' })
    }

    const email = doctorEmailFromDni(dni)
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: String(dni),
      email_confirm: true,
      user_metadata: { role: 'doctor' },
    })

    if (createError || !createdUser.user) {
      throw new Error(createError?.message || 'No se pudo crear el usuario del doctor.')
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: createdUser.user.id,
        dni: String(dni).trim(),
        full_name: fullName || null,
        role: 'doctor',
      })

    if (profileError) {
      throw new Error(profileError.message)
    }

    const { error: detailError } = await supabase
      .from('doctor_details')
      .insert({
        profile_id: createdUser.user.id,
        especialidad_id: especialidadId,
        turno,
      })

    if (detailError) {
      throw new Error(detailError.message)
    }

    return sendJson(res, 201, {
      ok: true,
      doctor: {
        id: createdUser.user.id,
        email,
        dni: String(dni).trim(),
      },
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo completar la operación de doctores.' })
  }
}
