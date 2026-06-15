import { allowMethods, readJson, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) {
    return
  }

  try {
    const { profile, supabase } = await requireProfile(req, ['doctor'])

    if (req.method === 'GET') {
      const [{ data: details, error: detailsError }, { data: especialidades, error: specialtiesError }] = await Promise.all([
        supabase
          .from('doctor_details')
          .select('*')
          .eq('profile_id', profile.id)
          .single(),
        supabase
          .from('especialidades')
          .select('id, nombre')
          .order('nombre'),
      ])

      if (detailsError) {
        throw new Error(detailsError.message)
      }

      if (specialtiesError) {
        throw new Error(specialtiesError.message)
      }

      return sendJson(res, 200, { profile, details, especialidades })
    }

    const { fullName, especialidadId, turno, newPassword } = await readJson(req)

    if (newPassword && String(newPassword).length < 8) {
      return sendJson(res, 400, { error: 'La nueva contrasena debe tener al menos 8 caracteres.' })
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (profileError) {
      throw new Error(profileError.message)
    }

    const { error: detailsError } = await supabase
      .from('doctor_details')
      .update({
        especialidad_id: especialidadId,
        turno,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', profile.id)

    if (detailsError) {
      throw new Error(detailsError.message)
    }

    return sendJson(res, 200, { ok: true })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo actualizar el perfil del doctor.' })
  }
}
