import { allowMethods, readJson, requireProfile, sendJson } from '../utils/request.js'

function doctorEmailFromDni(dni) {
  return `${String(dni).trim()}@doctor.healthid.local`
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
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
    return sendJson(res, 500, { error: error.message || 'No se pudo crear el doctor.' })
  }
}
