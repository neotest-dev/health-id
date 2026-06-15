import {
  decryptAESKeyWithRSA,
  decryptJsonPayload,
  descriptorDistance,
  hashLookupValue,
} from './crypto.js'
import { getAdminSupabase } from './supabase.js'

const FACE_THRESHOLD = 0.62

export async function resolvePatientByDniAndFace(dni, descriptorFacial) {
  const supabase = getAdminSupabase()
  const dniHash = hashLookupValue(dni)

  const { data: patient, error: patientError } = await supabase
    .from('pacientes')
    .select('*')
    .eq('dni_hash', dniHash)
    .single()

  if (patientError || !patient) {
    throw new Error('No se encontro un paciente asociado a ese DNI.')
  }

  const distance = descriptorDistance(patient.descriptor_facial, descriptorFacial)

  if (distance >= FACE_THRESHOLD) {
    throw new Error('El rostro no coincide con la identidad registrada.')
  }

  const aesKey = decryptAESKeyWithRSA(patient.llave_aes_cifrada, patient.llave_privada_rsa)
  const datos = decryptJsonPayload(
    {
      datosCifrados: patient.datos_cifrados,
      iv: patient.iv,
      authTag: patient.auth_tag,
    },
    aesKey,
  )

  const { data: citas, error: citasError } = await supabase
    .from('citas')
    .select('id, codigo, estado, created_at, fecha_cita, especialidades(nombre), doctor_profile_id')
    .eq('paciente_id', patient.id)
    .order('created_at', { ascending: false })

  if (citasError) {
    throw new Error('No se pudieron recuperar las citas del paciente.')
  }

  const cita = citas[0]
  const doctorId = cita?.doctor_profile_id
  let doctorName = null

  if (doctorId) {
    const { data: doctor } = await supabase
      .from('profiles')
      .select('full_name, dni')
      .eq('id', doctorId)
      .single()

    doctorName = doctor?.full_name || doctor?.dni || null
  }

  return {
    patient,
    datos,
    cita: cita
        ? {
          ...cita,
          especialidad: cita.especialidades?.nombre || 'Sin especialidad',
          doctor: doctorName,
        }
      : null,
    distance,
  }
}
