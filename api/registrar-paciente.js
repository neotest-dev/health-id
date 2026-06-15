import {
  encryptAESKeyWithRSA,
  encryptJsonPayload,
  generateAESKey,
  generateRSAKeyPair,
  hashLookupValue,
} from './utils/crypto.js'
import { allowMethods, readJson, sendJson } from './utils/request.js'
import { getAdminSupabase } from './utils/supabase.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const body = await readJson(req)
    const {
      dni,
      nombre,
      edad,
      tipoSangre,
      alergias,
      sintomas,
      especialidadId,
      disponibilidadId,
      descriptorFacial,
    } = body

    if (!dni || !nombre || !edad || !tipoSangre || !alergias || !sintomas || !especialidadId || !disponibilidadId || !Array.isArray(descriptorFacial)) {
      return sendJson(res, 400, { error: 'Faltan datos requeridos para registrar al paciente.' })
    }

    const supabase = getAdminSupabase()
    const aesKey = generateAESKey()
    const { publicKey, privateKey } = generateRSAKeyPair()
    const { datosCifrados, iv, authTag } = encryptJsonPayload({
      dni,
      nombre,
      edad: Number(edad),
      tipoSangre,
      alergias,
      sintomas,
    }, aesKey)

    const llaveAesCifrada = encryptAESKeyWithRSA(aesKey, publicKey)
    const dniHash = hashLookupValue(dni)

    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .insert({
        dni_hash: dniHash,
        datos_cifrados: datosCifrados,
        llave_aes_cifrada: llaveAesCifrada,
        iv,
        auth_tag: authTag,
        llave_privada_rsa: privateKey,
        descriptor_facial: descriptorFacial,
      })
      .select('id')
      .single()

    if (patientError) {
      throw new Error(patientError.message)
    }

    const { data: disponibilidad, error: disponibilidadError } = await supabase
      .from('disponibilidades')
      .select('id, fecha, especialidad_id, doctor_profile_id, cupos_disponibles, activa')
      .eq('id', disponibilidadId)
      .single()

    if (disponibilidadError || !disponibilidad) {
      throw new Error('La fecha seleccionada ya no esta disponible.')
    }

    if (!disponibilidad.activa || disponibilidad.especialidad_id !== especialidadId) {
      throw new Error('La disponibilidad elegida no coincide con la especialidad seleccionada.')
    }

    if (disponibilidad.cupos_disponibles <= 0) {
      throw new Error('La fecha seleccionada ya no tiene cupos disponibles.')
    }

    const { data: updatedAvailability, error: availabilityUpdateError } = await supabase
      .from('disponibilidades')
      .update({ cupos_disponibles: disponibilidad.cupos_disponibles - 1 })
      .eq('id', disponibilidad.id)
      .eq('cupos_disponibles', disponibilidad.cupos_disponibles)
      .select('id')
      .single()

    if (availabilityUpdateError || !updatedAvailability) {
      throw new Error('La fecha seleccionada se acaba de quedar sin cupos. Elige otra fecha.')
    }

    const codigo = `CITA-${patient.id.slice(0, 8).toUpperCase()}`

    const { data: cita, error: citaError } = await supabase
      .from('citas')
      .insert({
        paciente_id: patient.id,
        especialidad_id: especialidadId,
        estado: 'programada',
        doctor_profile_id: disponibilidad.doctor_profile_id,
        disponibilidad_id: disponibilidad.id,
        fecha_cita: disponibilidad.fecha,
        codigo,
      })
      .select('id, codigo, estado, fecha_cita')
      .single()

    if (citaError) {
      await supabase
        .from('disponibilidades')
        .update({ cupos_disponibles: disponibilidad.cupos_disponibles })
        .eq('id', disponibilidad.id)

      throw new Error(citaError.message)
    }

    return sendJson(res, 201, {
      ok: true,
      cita,
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo registrar al paciente.' })
  }
}
