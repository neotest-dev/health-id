import { allowMethods, readJson, requireProfile, sendJson } from '../../lib/api-utils/request.js'
import { getAdminSupabase } from '../../lib/api-utils/supabase.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST', 'PUT', 'DELETE'])) {
    return
  }

  if (req.method === 'GET') {
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

  try {
    const { supabase } = await requireProfile(req, ['admin'])

    if (req.method === 'POST') {
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
    }

    if (req.method === 'PUT') {
      const { id, nombre, descripcion } = await readJson(req)

      if (!id || !nombre) {
        return sendJson(res, 400, { error: 'Id y nombre son obligatorios.' })
      }

      const { data, error } = await supabase
        .from('especialidades')
        .update({ nombre, descripcion: descripcion || null })
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return sendJson(res, 200, { ok: true, especialidad: data })
    }

    const { id } = req.query || {}

    if (!id) {
      return sendJson(res, 400, { error: 'El id de la especialidad es obligatorio.' })
    }

    const [doctorUsage, availabilityUsage, appointmentsUsage] = await Promise.all([
      supabase.from('doctor_details').select('id', { count: 'exact', head: true }).eq('especialidad_id', id),
      supabase.from('disponibilidades').select('id', { count: 'exact', head: true }).eq('especialidad_id', id),
      supabase.from('citas').select('id', { count: 'exact', head: true }).eq('especialidad_id', id),
    ])

    if (doctorUsage.error || availabilityUsage.error || appointmentsUsage.error) {
      throw new Error(doctorUsage.error?.message || availabilityUsage.error?.message || appointmentsUsage.error?.message)
    }

    const totalUsage = (doctorUsage.count || 0) + (availabilityUsage.count || 0) + (appointmentsUsage.count || 0)

    if (totalUsage > 0) {
      return sendJson(res, 400, { error: 'No se puede eliminar una especialidad que ya esta en uso.' })
    }

    const { error } = await supabase
      .from('especialidades')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    return sendJson(res, 200, { ok: true })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo completar la operacion de especialidades.' })
  }
}
