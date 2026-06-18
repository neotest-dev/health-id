import { allowMethods, readJson, requireProfile, sendJson } from '../../lib/api-utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST', 'PUT', 'PATCH'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])

    if (req.method === 'GET') {
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
            doctor_profile_id: item.doctor_profile_id,
            doctor: doctor?.full_name || doctor?.dni || 'Sin doctor',
            especialidad: specialtiesById.get(item.especialidad_id) || 'Sin especialidad',
          }
        }),
      })
    }

    if (req.method === 'PUT') {
      const { id, fecha, cuposTotales } = await readJson(req)

      if (!id || !fecha || !cuposTotales) {
        return sendJson(res, 400, { error: 'Id, fecha y cupos son obligatorios.' })
      }

      const total = Number(cuposTotales)
      if (!Number.isInteger(total) || total <= 0) {
        return sendJson(res, 400, { error: 'Los cupos deben ser un numero entero mayor a cero.' })
      }

      const today = new Date().toISOString().slice(0, 10)
      if (fecha < today) {
        return sendJson(res, 400, { error: 'No puedes usar una fecha pasada.' })
      }

      const { data: currentAvailability, error: currentError } = await supabase
        .from('disponibilidades')
        .select('id, cupos_totales, cupos_disponibles')
        .eq('id', id)
        .single()

      if (currentError || !currentAvailability) {
        return sendJson(res, 404, { error: 'No se encontro la disponibilidad.' })
      }

      const usedSlots = currentAvailability.cupos_totales - currentAvailability.cupos_disponibles
      if (total < usedSlots) {
        return sendJson(res, 400, { error: 'No puedes dejar menos cupos de los ya reservados.' })
      }

      const { error } = await supabase
        .from('disponibilidades')
        .update({
          fecha,
          cupos_totales: total,
          cupos_disponibles: total - usedSlots,
        })
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      return sendJson(res, 200, { ok: true })
    }

    if (req.method === 'PATCH') {
      const { id, activa } = await readJson(req)

      if (!id || typeof activa !== 'boolean') {
        return sendJson(res, 400, { error: 'Id y estado activo son obligatorios.' })
      }

      const { error } = await supabase
        .from('disponibilidades')
        .update({ activa })
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }

      return sendJson(res, 200, { ok: true })
    }

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
    return sendJson(res, 500, { error: error.message || 'No se pudo completar la operación de disponibilidades.' })
  }
}
