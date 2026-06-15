import { allowMethods, readJson, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
    const { nombre, descripcion } = await readJson(req)

    if (!nombre) {
      return sendJson(res, 400, { error: 'El nombre de la especialidad es obligatorio.' })
    }

    const { data, error } = await supabase
      .from('especialidades')
      .insert({ nombre, descripcion })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return sendJson(res, 201, { ok: true, especialidad: data })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo crear la especialidad.' })
  }
}
