import { allowMethods, requireProfile, sendJson } from '../utils/request.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) {
    return
  }

  try {
    const { supabase } = await requireProfile(req, ['admin'])
    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select('id, codigo, estado, created_at, fecha_cita, paciente_id, especialidad_id, doctor_profile_id')
      .order('created_at', { ascending: false })

    if (citasError) {
      throw new Error(citasError.message)
    }

    const patientIds = [...new Set((citas || []).map((cita) => cita.paciente_id).filter(Boolean))]
    const doctorIds = [...new Set((citas || []).map((cita) => cita.doctor_profile_id).filter(Boolean))]
    const especialidadIds = [...new Set((citas || []).map((cita) => cita.especialidad_id).filter(Boolean))]

    const [patientsResult, doctorsResult, specialtiesResult] = await Promise.all([
      patientIds.length
        ? supabase.from('pacientes').select('id, dni_hash').in('id', patientIds)
        : Promise.resolve({ data: [], error: null }),
      doctorIds.length
        ? supabase.from('profiles').select('id, dni, full_name').in('id', doctorIds)
        : Promise.resolve({ data: [], error: null }),
      especialidadIds.length
        ? supabase.from('especialidades').select('id, nombre').in('id', especialidadIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (patientsResult.error) {
      throw new Error(patientsResult.error.message)
    }

    if (doctorsResult.error) {
      throw new Error(doctorsResult.error.message)
    }

    if (specialtiesResult.error) {
      throw new Error(specialtiesResult.error.message)
    }

    const patientsById = new Map((patientsResult.data || []).map((patient) => [patient.id, patient]))
    const doctorsById = new Map((doctorsResult.data || []).map((doctor) => [doctor.id, doctor]))
    const specialtiesById = new Map((specialtiesResult.data || []).map((especialidad) => [especialidad.id, especialidad]))

    return sendJson(res, 200, {
      citas: (citas || []).map((cita) => {
        const patient = patientsById.get(cita.paciente_id)
        const doctor = cita.doctor_profile_id ? doctorsById.get(cita.doctor_profile_id) : null
        const especialidad = specialtiesById.get(cita.especialidad_id)

        return {
          id: cita.id,
          codigo: cita.codigo,
          estado: cita.estado,
          created_at: cita.created_at,
          fecha_cita: cita.fecha_cita,
          especialidad: especialidad?.nombre || 'Sin especialidad',
          paciente_ref: patient?.dni_hash ? patient.dni_hash.slice(0, 12) : 'Sin referencia',
          doctor: doctor?.full_name || doctor?.dni || 'Sin asignar',
        }
      }),
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudieron listar las citas.' })
  }
}
