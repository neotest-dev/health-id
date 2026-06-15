import { allowMethods, readJson, sendJson } from '../utils/request.js'
import { resolvePatientByDniAndFace } from '../utils/patients.js'

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) {
    return
  }

  try {
    const { dni, descriptorFacial } = await readJson(req)

    if (!dni || !Array.isArray(descriptorFacial)) {
      return sendJson(res, 400, { error: 'DNI y descriptor facial son obligatorios.' })
    }

    const { datos, cita } = await resolvePatientByDniAndFace(dni, descriptorFacial)

    return sendJson(res, 200, {
      ok: true,
      paciente: datos,
      cita,
    })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'No se pudo consultar la cita.' })
  }
}
