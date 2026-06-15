import { allowMethods, sendJson } from '../utils/request.js'
import { getAdminSupabase } from '../utils/supabase.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .order('nombre')

    if (error) {
      throw new Error(error.message)
    }

    return sendJson(res, 200, { especialidades: data || [] })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudieron listar las especialidades.' })
  }
}
